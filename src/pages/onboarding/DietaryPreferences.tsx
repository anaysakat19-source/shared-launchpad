import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Leaf, Beef, Sprout } from "lucide-react";

const formSchema = z.object({
  dietType: z.enum(["vegetarian", "non_vegetarian", "vegan"]),
  budgetRange: z.string(),
  allergies: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

const commonAllergies = [
  "Dairy",
  "Eggs",
  "Nuts",
  "Peanuts",
  "Shellfish",
  "Soy",
  "Wheat/Gluten",
  "Fish",
];

const DietaryPreferences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietType: "non_vegetarian",
      budgetRange: "moderate",
      allergies: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
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

      const { error } = await supabase
        .from("dietary_preferences")
        .insert({
          user_id: user.id,
          diet_type: data.dietType,
          budget_range: data.budgetRange,
          allergies: data.allergies || [],
        });

      if (error) throw error;

      // Calculate nutrition targets
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-nutrition`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (nutritionError) {
        console.error('Error calculating nutrition:', nutritionError);
      }

      toast({
        title: "Success!",
        description: "Your profile is now complete!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2 mb-4">
            <Progress value={100} className="h-2" />
            <p className="text-sm text-muted-foreground">Step 4 of 4</p>
          </div>
          <CardTitle className="text-2xl">Dietary Preferences</CardTitle>
          <CardDescription>
            Tell us about your dietary preferences and restrictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dietType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Diet Type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-4">
                        <label
                          htmlFor="non_vegetarian"
                          className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem value="non_vegetarian" id="non_vegetarian" />
                          <Beef className="h-5 w-5 text-accent" />
                          <div>
                            <p className="font-medium">Non-Vegetarian</p>
                            <p className="text-sm text-muted-foreground">Includes all foods</p>
                          </div>
                        </label>
                        <label
                          htmlFor="vegetarian"
                          className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem value="vegetarian" id="vegetarian" />
                          <Leaf className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Vegetarian</p>
                            <p className="text-sm text-muted-foreground">No meat or fish</p>
                          </div>
                        </label>
                        <label
                          htmlFor="vegan"
                          className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                          <RadioGroupItem value="vegan" id="vegan" />
                          <Sprout className="h-5 w-5 text-secondary" />
                          <div>
                            <p className="font-medium">Vegan</p>
                            <p className="text-sm text-muted-foreground">No animal products</p>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low (₹1,000 - ₹3,000/month)</SelectItem>
                        <SelectItem value="moderate">Moderate (₹2,000 - ₹7,000/month)</SelectItem>
                        <SelectItem value="high">High (₹5,000 - ₹20,000/month)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={() => (
                  <FormItem>
                    <FormLabel>Food Allergies (Optional)</FormLabel>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {commonAllergies.map((allergy) => (
                        <FormField
                          key={allergy}
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(allergy)}
                                  onCheckedChange={(checked) => {
                                    const value = field.value || [];
                                    return checked
                                      ? field.onChange([...value, allergy])
                                      : field.onChange(value.filter((val) => val !== allergy));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">{allergy}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/onboarding/health")} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Completing..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DietaryPreferences;
