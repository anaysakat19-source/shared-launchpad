import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Dumbbell, Clock, TrendingUp, Play, Flame, Footprints,
  Calendar, Trophy, Target, ChevronRight, Zap, Heart,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Workout() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUserId(session.user.id);
    await Promise.all([
      fetchWorkouts(session.user.id),
      fetchWorkoutLogs(session.user.id),
    ]);
    setLoading(false);
  };

  const fetchWorkouts = async (uid: string) => {
    const { data: conditions } = await supabase
      .from('health_conditions')
      .select('condition_name')
      .eq('user_id', uid);

    const conditionNames = conditions?.map(c => c.condition_name.toLowerCase()) || [];
    setHealthConditions(conditionNames);

    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('*')
      .order('difficulty_level');

    const filtered = workoutsData?.filter((w: any) => {
      if (!w.condition_tags || w.condition_tags.length === 0) return true;
      return w.condition_tags.some((tag: string) =>
        conditionNames.includes(tag.toLowerCase())
      );
    });
    setWorkouts(filtered || []);
  };

  const fetchWorkoutLogs = async (uid: string) => {
    const { data } = await supabase
      .from('workout_logs')
      .select('*, workouts(*)')
      .eq('user_id', uid)
      .order('completed_at', { ascending: false })
      .limit(50);
    setWorkoutLogs(data || []);
  };

  const startWorkout = async (workoutId: string) => {
    if (!userId) return;
    try {
      const workout = workouts.find(w => w.id === workoutId);
      const { error } = await supabase
        .from('workout_logs')
        .insert([{
          user_id: userId,
          workout_id: workoutId,
          duration_minutes: workout?.duration_minutes || null,
        }]);
      if (error) throw error;
      toast.success('Workout logged! Keep it up! 💪');
      fetchWorkoutLogs(userId);
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-primary text-primary-foreground';
      case 'intermediate': return 'bg-warning text-warning-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // ---- Stats calculations ----
  const today = new Date();
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  const logsThisWeek = workoutLogs.filter(
    l => new Date(l.completed_at) >= thisWeekStart
  );
  const totalMinutesThisWeek = logsThisWeek.reduce(
    (s, l) => s + (l.duration_minutes || l.workouts?.duration_minutes || 0), 0
  );
  const estimatedCalories = totalMinutesThisWeek * 6; // rough estimate

  // Streak: count consecutive days with at least 1 log
  const getStreak = () => {
    if (workoutLogs.length === 0) return 0;
    const logDates = [...new Set(
      workoutLogs.map(l => new Date(l.completed_at).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const check = new Date();
    for (const dateStr of logDates) {
      const checkStr = check.toDateString();
      if (dateStr === checkStr) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();
  const weeklyGoal = 5; // sessions per week
  const weeklyProgress = Math.min((logsThisWeek.length / weeklyGoal) * 100, 100);

  // Recommended: top 3 easiest matching workouts not done today
  const todayStr = today.toDateString();
  const doneToday = new Set(
    workoutLogs
      .filter(l => new Date(l.completed_at).toDateString() === todayStr)
      .map(l => l.workout_id)
  );
  const recommended = workouts
    .filter(w => !doneToday.has(w.id))
    .slice(0, 3);

  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading workouts...</p>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Workouts</h1>
              <p className="text-muted-foreground text-sm mt-1">Stay consistent, stay strong</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10">
              <Dumbbell className="w-7 h-7 text-primary" />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="w-6 h-6 mx-auto text-accent mb-1" />
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Footprints className="w-6 h-6 mx-auto text-secondary mb-1" />
                <p className="text-2xl font-bold">{logsThisWeek.length}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{totalMinutesThisWeek}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 mx-auto text-warning mb-1" />
                <p className="text-2xl font-bold">{estimatedCalories}</p>
                <p className="text-xs text-muted-foreground">Cal Burned</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Goal Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Weekly Goal</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {logsThisWeek.length}/{weeklyGoal} sessions
                </span>
              </div>
              <Progress value={weeklyProgress} className="h-2.5" />
            </CardContent>
          </Card>

          {/* Health conditions */}
          {healthConditions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">Personalized for</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {healthConditions.map((c, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs: Recommended / All / History */}
          <Tabs defaultValue="recommended" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="all">All Workouts</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Recommended Tab */}
            <TabsContent value="recommended" className="space-y-4">
              {recommended.length === 0 ? (
                <Card className="p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold text-lg">All done for today!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You've completed all recommended workouts. Rest up! 🎉
                  </p>
                </Card>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Based on your profile and health conditions
                  </p>
                  {recommended.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      getDifficultyColor={getDifficultyColor}
                      onStart={startWorkout}
                      featured
                    />
                  ))}
                </>
              )}
            </TabsContent>

            {/* All Workouts Tab */}
            <TabsContent value="all" className="space-y-4">
              {workouts.length === 0 ? (
                <Card className="p-12 text-center">
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Workouts Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Check back soon for new workout plans!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      getDifficultyColor={getDifficultyColor}
                      onStart={startWorkout}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-3">
              {workoutLogs.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-semibold">No workout history yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start your first workout to begin tracking!
                  </p>
                </Card>
              ) : (
                workoutLogs.slice(0, 20).map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Dumbbell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {log.workouts?.name || 'Workout'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.completed_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {log.duration_minutes || log.workouts?.duration_minutes || '–'} min
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ~{(log.duration_minutes || log.workouts?.duration_minutes || 0) * 6} cal
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

// --- Extracted Workout Card component ---
function WorkoutCard({
  workout,
  getDifficultyColor,
  onStart,
  featured = false,
}: {
  workout: any;
  getDifficultyColor: (level: string) => string;
  onStart: (id: string) => void;
  featured?: boolean;
}) {
  return (
    <Card className={`overflow-hidden ${featured ? 'border-primary/30' : ''}`}>
      {featured && (
        <div className="bg-primary/10 px-4 py-1.5 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Recommended for you</span>
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold leading-tight">{workout.name}</h3>
          <Badge className={getDifficultyColor(workout.difficulty_level)}>
            {workout.difficulty_level}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {workout.description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{workout.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>
              {Array.isArray(workout.exercise_list) ? workout.exercise_list.length : 0} exercises
            </span>
          </div>
        </div>

        {workout.condition_tags && workout.condition_tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {workout.condition_tags.map((tag: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button className="w-full" onClick={() => onStart(workout.id)}>
          <Play className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
}
