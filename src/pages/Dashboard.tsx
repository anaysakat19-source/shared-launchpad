import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [nutritionTargets, setNutritionTargets] = useState<any>(null);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
        loadProfile(user.id);
        loadDashboardData(user.id);
      }
    });
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const loadDashboardData = async (userId: string) => {
    // Load nutrition targets
    const { data: targets } = await supabase
      .from('nutrition_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    setNutritionTargets(targets);

    // Load today's meals
    const today = new Date().toISOString().split('T')[0];
    const { data: meals } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);
    setTodayMeals(meals || []);

    // Load recent workout logs
    const { data: workouts } = await supabase
      .from('workout_logs')
      .select('*, workouts(*)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(3);
    setRecentWorkouts(workouts || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const completedMeals = todayMeals.filter(m => m.is_completed).length;
  const totalCalories = todayMeals
    .filter(m => m.is_completed)
    .reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Welcome back, {profile.first_name}!</h1>
              <p className="text-muted-foreground mt-2">Your personalized dashboard</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Daily Nutrition Card */}
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Today's Nutrition</CardTitle>
                <CardDescription>Track your daily calorie and macro goals</CardDescription>
              </CardHeader>
              <CardContent>
                {nutritionTargets ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Calories</span>
                        <span className="text-sm text-muted-foreground">
                          {totalCalories} / {nutritionTargets.daily_calories}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((totalCalories / nutritionTargets.daily_calories) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{nutritionTargets.protein_grams}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">{nutritionTargets.carbs_grams}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary">{nutritionTargets.fats_grams}g</p>
                        <p className="text-xs text-muted-foreground">Fats</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No nutrition targets set yet</p>
                    <Button onClick={() => navigate('/meals')}>Get Started</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your basic information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Age:</strong> {profile.age}</p>
                  <p><strong>Height:</strong> {profile.height_cm} cm</p>
                  <p><strong>Weight:</strong> {profile.weight_kg} kg</p>
                  <p><strong>Activity:</strong> {profile.activity_level?.replace(/_/g, ' ')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Today's Meals Card */}
            <Card className="col-span-full md:col-span-1">
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
                <CardDescription>Completed: {completedMeals}/{todayMeals.length}</CardDescription>
              </CardHeader>
              <CardContent>
                {todayMeals.length > 0 ? (
                  <div className="space-y-2">
                    {todayMeals.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{meal.meal_type}</span>
                        <span className={`text-sm ${meal.is_completed ? 'text-primary' : 'text-muted-foreground'}`}>
                          {meal.is_completed ? '✓' : '○'}
                        </span>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/meals')}>
                      View Meal Plan
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">No meals planned yet</p>
                    <Button size="sm" onClick={() => navigate('/meals')}>Generate Meals</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Workouts Card */}
            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
                <CardDescription>Your workout activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {recentWorkouts.map((log) => (
                      <div key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <p className="font-medium">{log.workouts?.name || 'Workout'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {log.duration_minutes || log.workouts?.duration_minutes} min
                        </span>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => navigate('/workout')}>
                      View All Workouts
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">No workouts logged yet</p>
                    <Button size="sm" onClick={() => navigate('/workout')}>Start Workout</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Dashboard;
