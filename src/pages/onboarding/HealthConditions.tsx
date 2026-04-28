import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const commonConditions = [
  { id: "back_pain", label: "Back Pain" },
  { id: "knee_pain", label: "Knee Pain" },
  { id: "diabetes", label: "Diabetes" },
  { id: "high_blood_pressure", label: "High Blood Pressure" },
  { id: "heart_condition", label: "Heart Condition" },
  { id: "asthma", label: "Asthma" },
  { id: "arthritis", label: "Arthritis" },
  { id: "obesity", label: "Obesity" },
];

const HealthConditions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [hasNone, setHasNone] = useState(false);

  const handleConditionToggle = (conditionId: string) => {
    setHasNone(false);
    setSelectedConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((id) => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleNoneToggle = () => {
    setHasNone(!hasNone);
    setSelectedConditions([]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    // Insert selected conditions
    if (selectedConditions.length > 0) {
      const conditionsToInsert = selectedConditions.map((conditionId) => ({
        user_id: user.id,
        condition_name: commonConditions.find((c) => c.id === conditionId)?.label || conditionId,
        notes: notes || null,
      }));

      const { error } = await supabase
        .from("health_conditions")
        .insert(conditionsToInsert);

      if (error) {
        setLoading(false);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(false);
    navigate("/onboarding/diet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2 mb-4">
            <Progress value={75} className="h-2" />
            <p className="text-sm text-muted-foreground">Step 3 of 4</p>
          </div>
          <CardTitle className="text-2xl">Health Conditions</CardTitle>
          <CardDescription>
            Help us personalize your experience by sharing any health conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Select all that apply</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {commonConditions.map((condition) => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition.id}
                      checked={selectedConditions.includes(condition.id)}
                      onCheckedChange={() => handleConditionToggle(condition.id)}
                      disabled={hasNone}
                    />
                    <label
                      htmlFor={condition.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {condition.label}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Checkbox
                  id="none"
                  checked={hasNone}
                  onCheckedChange={handleNoneToggle}
                />
                <label
                  htmlFor="none"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  None of the above
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any other health information we should know about..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/onboarding/goals")} className="flex-1">
                Back
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate("/onboarding/diet")} className="flex-1">
                Skip
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthConditions;
