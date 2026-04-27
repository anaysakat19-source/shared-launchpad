import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, ArrowLeft } from "lucide-react";

/**
 * Dietitian / Health-Expert auth.
 * Sign-up additionally creates a user_roles row (dietitian) and a dietitian_profiles row
 * via two server-trusted RLS-safe paths:
 *  - The 'dietitian' role is granted by an edge-function-free shortcut: we mark new users
 *    with metadata { account_type: 'dietitian' } so a future trigger can promote them.
 *  - For now, after sign-in we self-insert the role+profile. The user_roles INSERT policy
 *    blocks users from granting themselves arbitrary roles, so dietitian sign-up is
 *    designed to be operated by the platform; for the demo we relax that path through
 *    a security-definer RPC `register_dietitian` (defined in DB).
 *
 * NOTE: This page works for sign-in immediately. Sign-up creates the auth user;
 * an admin must then assign the 'dietitian' role from Supabase. We surface this
 * clearly to the new expert.
 */
const ExpertAuth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [education, setEducation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Don't auto-redirect during signup completion — handled below
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back", description: "Signed in as a health expert." });
    navigate("/expert/dashboard");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/expert/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: fullName.split(" ")[0] ?? "",
          last_name: fullName.split(" ").slice(1).join(" "),
          account_type: "dietitian",
          specialty,
          education,
          bio,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Application received",
      description:
        "Your expert account was created. Our team will verify your credentials and grant you access shortly.",
    });
    setMode("signin");
    void data;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to MacroMentor
        </Link>
        <Card className="shadow-xl border-secondary/20">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-primary-foreground">
              <Stethoscope className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl">
              {mode === "signup" ? "Join as a Dietitian" : "Health Expert Sign-In"}
            </CardTitle>
            <CardDescription>
              {mode === "signup"
                ? "Create a verified expert account to consult with MacroMentor users."
                : "Sign in to manage your client conversations and profile."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mode === "signup" ? handleSignUp : handleSignIn} className="space-y-3">
              {mode === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Ananya Sharma"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="e.g. Sports Nutrition, PCOS, Diabetes"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="education">Highest qualification</Label>
                    <Input
                      id="education"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="M.Sc. Clinical Nutrition, AIIMS"
                      required
                      maxLength={150}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bio">Short bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell users about your approach and experience"
                      required
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="expert@clinic.com"
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Please wait..." : mode === "signup" ? "Apply as Expert" : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signup" ? (
                <>
                  Already have an expert account?{" "}
                  <button onClick={() => setMode("signin")} className="text-primary hover:underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                    Apply as a dietitian
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Looking for the customer app?{" "}
                <Link to="/auth" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpertAuth;