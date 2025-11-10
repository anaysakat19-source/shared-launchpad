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
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get health goals
    const { data: goals } = await supabaseClient
      .from('health_goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile || !goals) {
      throw new Error('Profile or goals not found');
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5;
    } else {
      bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161;
    }

    // Activity factor multipliers
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    const activityFactor = activityFactors[profile.activity_level] || 1.2;
    let dailyCalories = bmr * activityFactor;

    // Adjust for goals
    if (goals.goal_type === 'lose_weight') {
      dailyCalories -= 500; // 500 calorie deficit for ~0.5kg per week
    } else if (goals.goal_type === 'gain_muscle') {
      dailyCalories += 300; // 300 calorie surplus for muscle gain
    }

    // Macronutrient distribution
    const proteinGrams = profile.weight_kg * (goals.goal_type === 'gain_muscle' ? 2.2 : 1.8);
    const fatsGrams = (dailyCalories * 0.25) / 9; // 25% of calories from fats
    const carbsGrams = (dailyCalories - (proteinGrams * 4) - (fatsGrams * 9)) / 4;

    // Save to nutrition_targets
    const { data: nutritionTarget, error } = await supabaseClient
      .from('nutrition_targets')
      .upsert({
        user_id: user.id,
        daily_calories: Math.round(dailyCalories),
        protein_grams: Math.round(proteinGrams),
        carbs_grams: Math.round(carbsGrams),
        fats_grams: Math.round(fatsGrams),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        bmr: Math.round(bmr),
        daily_calories: Math.round(dailyCalories),
        protein_grams: Math.round(proteinGrams),
        carbs_grams: Math.round(carbsGrams),
        fats_grams: Math.round(fatsGrams),
      }),
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
