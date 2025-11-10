import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TrendingDown, TrendingUp, Weight, Trophy, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function Progress() {
  const navigate = useNavigate();
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

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
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch weight logs
      const { data: logs } = await supabase
        .from('weight_logs')
        .select('*')
        .order('logged_at', { ascending: true });
      setWeightLogs(logs || []);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      setProfile(profileData);

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      setGoals(goalsData);

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('earned_at', { ascending: false });
      setAchievements(achievementsData || []);
    } catch (error: any) {
      toast.error('Error fetching data: ' + error.message);
    }
  };

  const logWeight = async () => {
    if (!newWeight) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('weight_logs')
        .insert([{
          user_id: user!.id,
          weight_kg: parseFloat(newWeight),
        }]);

      if (error) throw error;

      toast.success('Weight logged successfully!');
      setNewWeight('');
      fetchData();
    } catch (error: any) {
      toast.error('Error logging weight: ' + error.message);
    }
  };

  const chartData = weightLogs.map(log => ({
    date: format(new Date(log.logged_at), 'MMM dd'),
    weight: parseFloat(log.weight_kg),
  }));

  const currentWeight = weightLogs[weightLogs.length - 1]?.weight_kg || profile?.weight_kg;
  const startWeight = weightLogs[0]?.weight_kg || profile?.weight_kg;
  const weightChange = currentWeight - startWeight;
  const targetWeight = goals?.target_weight_kg;
  const progressPercent = targetWeight
    ? Math.abs(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Progress Tracking</h1>

        {/* Weight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Current Weight</h3>
            </div>
            <p className="text-3xl font-bold">{currentWeight?.toFixed(1)} kg</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {weightChange < 0 ? (
                <TrendingDown className="w-5 h-5 text-success" />
              ) : (
                <TrendingUp className="w-5 h-5 text-warning" />
              )}
              <h3 className="font-semibold">Change</h3>
            </div>
            <p className="text-3xl font-bold">
              {weightChange > 0 ? '+' : ''}
              {weightChange.toFixed(1)} kg
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Progress</h3>
            </div>
            <p className="text-3xl font-bold">{progressPercent.toFixed(0)}%</p>
          </Card>
        </div>

        {/* Weight Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Weight Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No weight data yet. Log your first weight below!
            </p>
          )}
        </Card>

        {/* Log Weight */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Log Weight</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Enter weight"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={logWeight} disabled={!newWeight}>
                Log Weight
              </Button>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Achievements</h3>
          </div>
          
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 rounded-lg bg-muted"
                >
                  <Trophy className="w-8 h-8 text-accent mb-2" />
                  <p className="font-medium text-center text-sm">
                    {achievement.badge_name}
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(achievement.earned_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Keep working towards your goals to earn achievements!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
