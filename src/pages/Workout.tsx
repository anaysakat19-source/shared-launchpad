import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dumbbell, Clock, TrendingUp, Play, CheckCircle } from 'lucide-react';

export default function Workout() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthConditions, setHealthConditions] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchData = async () => {
    try {
      // Fetch user health conditions
      const { data: conditions } = await supabase
        .from('health_conditions')
        .select('condition_name');
      
      const conditionNames = conditions?.map(c => c.condition_name.toLowerCase()) || [];
      setHealthConditions(conditionNames);

      // Fetch all workouts
      const { data: workoutsData, error } = await supabase
        .from('workouts')
        .select('*')
        .order('difficulty_level');

      if (error) throw error;

      // Filter workouts based on health conditions
      const filteredWorkouts = workoutsData?.filter((workout: any) => {
        if (!workout.condition_tags || workout.condition_tags.length === 0) {
          return true; // Include workouts with no specific conditions
        }
        
        // Check if workout is suitable for user's conditions
        return workout.condition_tags.some((tag: string) => 
          conditionNames.includes(tag.toLowerCase())
        );
      });

      setWorkouts(filteredWorkouts || []);
    } catch (error: any) {
      toast.error('Error fetching workouts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async (workoutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('workout_logs')
        .insert([{
          user_id: user!.id,
          workout_id: workoutId,
        }]);

      if (error) throw error;

      toast.success('Workout started! Great job!');
    } catch (error: any) {
      toast.error('Error starting workout: ' + error.message);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Workouts</h1>
          <Dumbbell className="w-8 h-8 text-primary" />
        </div>

        {healthConditions.length > 0 && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Workouts personalized for:
            </p>
            <div className="flex flex-wrap gap-2">
              {healthConditions.map((condition, idx) => (
                <Badge key={idx} variant="secondary">
                  {condition}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading workouts...</p>
          </div>
        ) : workouts.length === 0 ? (
          <Card className="p-12 text-center">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Workouts Available</h3>
            <p className="text-sm text-muted-foreground">
              Check back soon for personalized workout recommendations!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map((workout) => (
              <Card key={workout.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{workout.name}</h3>
                  <Badge className={getDifficultyColor(workout.difficulty_level)}>
                    {workout.difficulty_level}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {workout.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{workout.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{workout.exercise_list?.length || 0} exercises</span>
                  </div>
                </div>

                {workout.condition_tags && workout.condition_tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Good for:</p>
                    <div className="flex flex-wrap gap-1">
                      {workout.condition_tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => startWorkout(workout.id)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
