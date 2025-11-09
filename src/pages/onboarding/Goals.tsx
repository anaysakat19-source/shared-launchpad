import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const formSchema = z.object({
  goalType: z.enum(["lose_weight", "gain_muscle", "maintain"]),
  targetWeightKg: z.coerce.number().optional(),
  timelineWeeks: z.coerce.number().optional(),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]),
});

type FormData = z.infer<typeof formSchema>;

const Goals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalType: "maintain",
      activityLevel: "moderately_active",
    },
  });

  const watchGoalType = form.watch("goalType");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to continue",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Update activity level in profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ activity_level: data.activityLevel })
      .eq("id", user.id);

    if (profileError) {
      setLoading(false);
      toast({
        title: "Error",
        description: profileError.message,
        variant: "destructive",
      });
      return;
    }

    // Insert health goal
    const { error: goalError } = await supabase
      .from("health_goals")
      .insert({
        user_id: user.id,
        goal_type: data.goalType,
        target_weight_kg: data.targetWeightKg,
        timeline_weeks: data.timelineWeeks,
      });

    setLoading(false);

    if (goalError) {
      toast({
        title: "Error",
        description: goalError.message,
        variant: "destructive",
      });
    } else {
      navigate("/onboarding/health");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2 mb-4">
            <Progress value={50} className="h-2" />
            <p className="text-sm text-muted-foreground">Step 2 of 4</p>
          </div>
          <CardTitle className="text-2xl">Health Goals</CardTitle>
          <CardDescription>What are you trying to achieve?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select Your Goal</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-4">
                        <label
                          htmlFor="lose_weight"
                          className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem value="lose_weight" id="lose_weight" />
                          <TrendingDown className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Lose Weight</p>
                            <p className="text-sm text-muted-foreground">Burn fat and get leaner</p>
                          </div>
                        </label>
                        <label
                          htmlFor="gain_muscle"
                          className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem value="gain_muscle" id="gain_muscle" />
                          <TrendingUp className="h-5 w-5 text-secondary" />
                          <div>
                            <p className="font-medium">Gain Muscle</p>
                            <p className="text-sm text-muted-foreground">Build strength and size</p>
                          </div>
                        </label>
                        <label
                          htmlFor="maintain"
                          className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem value="maintain" id="maintain" />
                          <Minus className="h-5 w-5 text-accent" />
                          <div>
                            <p className="font-medium">Maintain Weight</p>
                            <p className="text-sm text-muted-foreground">Stay healthy and consistent</p>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchGoalType !== "maintain" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetWeightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="65" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timelineWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline (weeks)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="12" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                        <SelectItem value="extremely_active">Extremely Active (athlete)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/onboarding/basic")} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;
