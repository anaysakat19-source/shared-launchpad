import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Dumbbell, Apple, TrendingUp } from "lucide-react";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Heart className="h-10 w-10 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">MacroMentor</h1>
          </div>
          
          <p className="text-xl text-muted-foreground">
            Your AI-powered nutrition and fitness companion for a healthier you
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/auth?mode=signin">Sign In</Link>
            </Button>
          </div>

          <Link to="/expert" className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline mt-2">
            Are you a dietitian or health expert? Join here →
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Apple className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Meal Plans</h3>
            <p className="text-muted-foreground">
              AI-generated meal plans tailored to your goals, preferences, and budget
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Workouts</h3>
            <p className="text-muted-foreground">
              Customized exercise routines based on your health conditions and fitness level
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your journey with detailed analytics and achievement badges
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MacroMentor?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="h-6 w-6 text-primary flex-shrink-0 mt-1">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Budget-Friendly</h4>
                <p className="text-muted-foreground text-sm">
                  Affordable nutrition guidance without expensive dieticians
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-6 w-6 text-primary flex-shrink-0 mt-1">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Time-Efficient</h4>
                <p className="text-muted-foreground text-sm">
                  Quick 10-20 minute workouts that fit your schedule
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-6 w-6 text-primary flex-shrink-0 mt-1">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Personalized</h4>
                <p className="text-muted-foreground text-sm">
                  AI-powered recommendations based on your unique profile
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-6 w-6 text-primary flex-shrink-0 mt-1">✓</div>
              <div>
                <h4 className="font-semibold mb-1">Health-Focused</h4>
                <p className="text-muted-foreground text-sm">
                  Considers your health conditions for safe recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
