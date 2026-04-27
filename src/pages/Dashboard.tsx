import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import EditProfileDialog from "@/components/dashboard/EditProfileDialog";
import {
  Flame, Utensils, Dumbbell, TrendingUp, Watch, ChevronRight,
  LogOut, Droplets, Zap, Target, MessageCircle, UserRound, Stethoscope,
} from "lucide-react";

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
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  };

  const loadDashboardData = async (userId: string) => {
    const [targetsRes, mealsRes, workoutsRes] = await Promise.all([
      supabase.from('nutrition_targets').select('*').eq('user_id', userId).eq('is_active', true).single(),
      supabase.from('meal_plans').select('*').eq('user_id', userId).eq('date', new Date().toISOString().split('T')[0]),
      supabase.from('workout_logs').select('*, workouts(*)').eq('user_id', userId).order('completed_at', { ascending: false }).limit(5),
    ]);
    setNutritionTargets(targetsRes.data);
    setTodayMeals(mealsRes.data || []);
    setRecentWorkouts(workoutsRes.data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const completedMeals = todayMeals.filter(m => m.is_completed).length;
  const totalCalories = todayMeals.filter(m => m.is_completed).reduce((s, m) => s + (m.calories || 0), 0);
  const calorieTarget = nutritionTargets?.daily_calories || 0;
  const caloriePct = calorieTarget > 0 ? Math.min((totalCalories / calorieTarget) * 100, 100) : 0;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground px-5 pt-10 pb-16 rounded-b-[2rem]">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium">{greeting}</p>
                <h1 className="text-3xl font-bold mt-1 tracking-tight">
                  {profile.first_name} {profile.last_name?.charAt(0)}.
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <EditProfileDialog userId={user.id} profile={profile} onSaved={() => loadProfile(user.id)} />
                <button onClick={handleSignOut} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Calorie Ring Card — floating */}
            <Card className="bg-card/95 backdrop-blur-lg border-0 shadow-xl -mb-20 relative z-20">
              <CardContent className="p-5">
                <div className="flex items-center gap-5">
                  {/* SVG Ring */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                      <circle
                        cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                        strokeLinecap="round" className="stroke-primary transition-all duration-700"
                        strokeDasharray={`${caloriePct * 2.64} 264`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-foreground">{totalCalories}</span>
                      <span className="text-[10px] text-muted-foreground">kcal</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Daily Goal</span>
                      <span className="font-semibold text-foreground">{calorieTarget} kcal</span>
                    </div>
                    {nutritionTargets && (
                      <div className="grid grid-cols-3 gap-2">
                        <MacroPill label="Protein" value={`${nutritionTargets.protein_grams}g`} color="bg-primary/15 text-primary" />
                        <MacroPill label="Carbs" value={`${nutritionTargets.carbs_grams}g`} color="bg-accent/15 text-accent" />
                        <MacroPill label="Fats" value={`${nutritionTargets.fats_grams}g`} color="bg-secondary/15 text-secondary" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main content — offset for the floating card */}
        <div className="max-w-4xl mx-auto px-5 pt-24 space-y-5">

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            <QuickAction icon={<Utensils className="w-5 h-5" />} label="Meals" onClick={() => navigate('/meals')} color="bg-primary/10 text-primary" />
            <QuickAction icon={<Dumbbell className="w-5 h-5" />} label="Workout" onClick={() => navigate('/workout')} color="bg-accent/10 text-accent" />
            <QuickAction icon={<TrendingUp className="w-5 h-5" />} label="Progress" onClick={() => navigate('/progress')} color="bg-secondary/10 text-secondary" />
            <QuickAction icon={<MessageCircle className="w-5 h-5" />} label="AI Chat" onClick={() => navigate('/chat')} color="bg-warning/10 text-warning" />
          </div>

          {/* Dietitian CTA */}
          <Card
            className="overflow-hidden cursor-pointer border-0 shadow-md hover:shadow-lg transition-shadow"
            onClick={() => navigate('/dietitians')}
          >
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-secondary via-secondary to-primary text-primary-foreground p-5">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5" />
                <div className="relative flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/15 backdrop-blur">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-primary-foreground/75 font-semibold">
                      1:1 Guidance
                    </p>
                    <h3 className="font-bold text-lg leading-tight">Talk to a Dietitian</h3>
                    <p className="text-xs text-primary-foreground/85 mt-0.5">
                      Chat with 8+ certified nutrition experts
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/messages');
                }}
                className="w-full px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Open my conversations
              </button>
            </CardContent>
          </Card>

          {/* Today's Meals */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Utensils className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Today's Meals</h3>
                </div>
                <button onClick={() => navigate('/meals')} className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {todayMeals.length > 0 ? (
                <div className="px-5 pb-4 space-y-2">
                  {todayMeals.map(meal => (
                    <div key={meal.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${meal.is_completed ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                        <div>
                          <p className="text-sm font-medium capitalize">{meal.meal_type}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{meal.recipe_name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{meal.calories || '–'} kcal</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">{completedMeals}/{todayMeals.length} completed</span>
                    <Progress value={(completedMeals / todayMeals.length) * 100} className="w-24 h-1.5" />
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No meals planned for today</p>
                  <Button size="sm" onClick={() => navigate('/meals')}>Generate Meal Plan</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-accent/10">
                    <Dumbbell className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-semibold text-sm">Recent Workouts</h3>
                </div>
                <button onClick={() => navigate('/workout')} className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {recentWorkouts.length > 0 ? (
                <div className="px-5 pb-4 space-y-2">
                  {recentWorkouts.slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-accent/10">
                          <Zap className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.workouts?.name || 'Workout'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {log.duration_minutes || log.workouts?.duration_minutes || '–'} min
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 pb-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No workouts logged yet</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/workout')}>Start Workout</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Summary + Wearable row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mini Profile */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{profile.first_name} {profile.last_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile.activity_level?.replace(/_/g, ' ') || 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <StatBox label="Age" value={profile.age || '–'} />
                  <StatBox label="Height" value={profile.height_cm ? `${profile.height_cm}cm` : '–'} />
                  <StatBox label="Weight" value={profile.weight_kg ? `${profile.weight_kg}kg` : '–'} />
                </div>
              </CardContent>
            </Card>

            {/* Wearable CTA */}
            <Card className="group cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate('/wearables')}>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Watch className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Connect Wearable</p>
                    <p className="text-xs text-muted-foreground">Smartwatch, ring, or band</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-medium">
                  Set up now <ChevronRight className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

/* ---- Small sub-components ---- */

function MacroPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl px-2.5 py-2 text-center ${color}`}>
      <p className="text-xs font-bold">{value}</p>
      <p className="text-[10px] opacity-70">{label}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border hover:shadow-md transition-all active:scale-95">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/50 rounded-xl py-2 px-1">
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default Dashboard;
