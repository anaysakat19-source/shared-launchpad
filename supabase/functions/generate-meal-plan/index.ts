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

    const { date, mealType } = await req.json();

    // Get user data
    const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
    const { data: nutritionTargets } = await supabaseClient.from('nutrition_targets').select('*').eq('user_id', user.id).eq('is_active', true).single();
    const { data: dietPrefs } = await supabaseClient.from('dietary_preferences').select('*').eq('user_id', user.id).single();
    const { data: healthConditions } = await supabaseClient.from('health_conditions').select('*').eq('user_id', user.id);

    if (!profile || !nutritionTargets || !dietPrefs) {
      throw new Error('User profile incomplete');
    }

    // Calculate meal calories (breakfast 25%, lunch 35%, dinner 30%, snacks 10%)
    const mealCalorieRatios: Record<string, number> = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snack: 0.10,
    };
    const targetCalories = Math.round(nutritionTargets.daily_calories * mealCalorieRatios[mealType]);

    const systemPrompt = `You are a nutrition expert creating personalized meal plans.
User Profile:
- Diet: ${dietPrefs.diet_type}
- Budget: ${dietPrefs.budget_range}
- Allergies: ${dietPrefs.allergies?.join(', ') || 'None'}
- Health conditions: ${healthConditions?.map(c => c.condition_name).join(', ') || 'None'}

Daily Nutrition Targets:
- Calories: ${nutritionTargets.daily_calories}
- Protein: ${nutritionTargets.protein_grams}g
- Carbs: ${nutritionTargets.carbs_grams}g
- Fats: ${nutritionTargets.fats_grams}g

Generate a ${mealType} recipe with approximately ${targetCalories} calories that:
1. Fits the user's diet type and budget
2. Avoids allergens
3. Uses simple, locally available ingredients
4. Takes 30 minutes or less to prepare

Return ONLY valid JSON (no markdown):
{
  "recipe_name": "Recipe name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "ingredients": [{"name": "ingredient", "quantity": "amount", "unit": "unit"}],
  "instructions": "Step by step instructions"
}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a ${mealType} recipe for ${date}` }
        ],
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    
    const mealData = JSON.parse(jsonMatch[0]);

    // Save to database
    const { data: meal, error } = await supabaseClient
      .from('meal_plans')
      .insert({
        user_id: user.id,
        date,
        meal_type: mealType,
        recipe_name: mealData.recipe_name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fats: mealData.fats,
        ingredients: mealData.ingredients,
        recipe_instructions: mealData.instructions,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(meal),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
