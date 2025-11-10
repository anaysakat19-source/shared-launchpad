import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, Loader2, Utensils, ChefHat } from 'lucide-react';
import { format } from 'date-fns';

export default function Meals() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchMeals();
  }, [selectedDate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('date', selectedDate)
        .order('meal_type');

      if (error) throw error;
      setMeals(data || []);
    } catch (error: any) {
      toast.error('Error fetching meals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMeal = async (mealType: string) => {
    setGenerating(mealType);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meal-plan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: selectedDate, mealType }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate meal');

      const newMeal = await response.json();
      setMeals(prev => [...prev.filter(m => m.meal_type !== mealType), newMeal]);
      toast.success('Meal generated successfully!');
    } catch (error: any) {
      toast.error('Error generating meal: ' + error.message);
    } finally {
      setGenerating(null);
    }
  };

  const toggleMealComplete = async (mealId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({ is_completed: !isCompleted })
        .eq('id', mealId);

      if (error) throw error;
      
      setMeals(prev =>
        prev.map(m => (m.id === mealId ? { ...m, is_completed: !isCompleted } : m))
      );
      toast.success(isCompleted ? 'Meal marked incomplete' : 'Meal completed!');
    } catch (error: any) {
      toast.error('Error updating meal: ' + error.message);
    }
  };

  const getMealForType = (type: string) => meals.find(m => m.meal_type === type);

  const MealCard = ({ type, label }: { type: string; label: string }) => {
    const meal = getMealForType(type);
    const isGenerating = generating === type;

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{label}</h3>
          </div>
          {!meal && (
            <Button
              onClick={() => generateMeal(type)}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          )}
        </div>

        {meal ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-lg mb-2">{meal.recipe_name}</h4>
              <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                <span>{meal.calories} cal</span>
                <span>P: {meal.protein}g</span>
                <span>C: {meal.carbs}g</span>
                <span>F: {meal.fats}g</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Ingredients:</p>
              <ul className="text-sm space-y-1">
                {meal.ingredients?.map((ing: any, idx: number) => (
                  <li key={idx} className="text-muted-foreground">
                    • {ing.quantity} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Instructions:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {meal.recipe_instructions}
              </p>
            </div>

            <Button
              variant={meal.is_completed ? "secondary" : "default"}
              className="w-full"
              onClick={() => toggleMealComplete(meal.id, meal.is_completed)}
            >
              {meal.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No meal planned yet. Click Generate to create one!
          </p>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meal Planning</h1>
          <Button variant="outline" size="icon">
            <Calendar className="w-5 h-5" />
          </Button>
        </div>

        <Card className="p-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-background border-none text-lg font-medium"
          />
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All Meals</TabsTrigger>
              <TabsTrigger value="breakfast" className="flex-1">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch" className="flex-1">Lunch</TabsTrigger>
              <TabsTrigger value="dinner" className="flex-1">Dinner</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <MealCard type="breakfast" label="Breakfast" />
              <MealCard type="lunch" label="Lunch" />
              <MealCard type="dinner" label="Dinner" />
              <MealCard type="snack" label="Snack" />
            </TabsContent>

            <TabsContent value="breakfast">
              <MealCard type="breakfast" label="Breakfast" />
            </TabsContent>

            <TabsContent value="lunch">
              <MealCard type="lunch" label="Lunch" />
            </TabsContent>

            <TabsContent value="dinner">
              <MealCard type="dinner" label="Dinner" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
