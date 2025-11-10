import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { message } = await req.json();

    // Get user context
    const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
    const { data: goals } = await supabaseClient.from('health_goals').select('*').eq('user_id', user.id).single();
    const { data: nutritionTargets } = await supabaseClient.from('nutrition_targets').select('*').eq('user_id', user.id).eq('is_active', true).single();
    const { data: dietPrefs } = await supabaseClient.from('dietary_preferences').select('*').eq('user_id', user.id).single();

    // Get recent chat history
    const { data: history } = await supabaseClient
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(10);

    const systemPrompt = `You are MacroMentor, a helpful AI nutrition and fitness assistant.

User Context:
- Name: ${profile?.first_name || 'User'}
- Age: ${profile?.age}, Gender: ${profile?.gender}
- Weight: ${profile?.weight_kg}kg, Height: ${profile?.height_cm}cm
- Activity Level: ${profile?.activity_level}
- Goal: ${goals?.goal_type}
${nutritionTargets ? `- Daily Targets: ${nutritionTargets.daily_calories} cal, ${nutritionTargets.protein_grams}g protein, ${nutritionTargets.carbs_grams}g carbs, ${nutritionTargets.fats_grams}g fats` : ''}
- Diet: ${dietPrefs?.diet_type}
- Allergies: ${dietPrefs?.allergies?.join(', ') || 'None'}

Provide personalized advice on:
- Nutrition and meal planning
- Food substitutions
- Workout recommendations
- Motivation and support
- Health and wellness tips

Keep responses concise, friendly, and actionable.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(h => ({ role: h.role, content: h.message })),
      { role: 'user', content: message }
    ];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    // Save user message
    await supabaseClient.from('chat_history').insert({
      user_id: user.id,
      role: 'user',
      message,
    });

    // Stream the response and save assistant message
    let fullResponse = '';
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }

          // Save assistant response
          if (fullResponse) {
            await supabaseClient.from('chat_history').insert({
              user_id: user.id,
              role: 'assistant',
              message: fullResponse,
            });
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
