import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { LogOut, MessageCircle, Stethoscope, Users, AlertCircle } from "lucide-react";

type Conversation = {
  id: string;
  customer_id: string;
  last_message_at: string;
};

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<{ id: string; full_name: string; specialty: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { isDietitian, loading: rolesLoading } = useUserRole(userId ?? undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/expert");
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? "");
    });
  }, [navigate]);

  useEffect(() => {
    if (!userId || rolesLoading) return;
    if (!isDietitian) return;
    (async () => {
      const { data: profileRow } = await supabase
        .from("dietitian_profiles")
        .select("id, full_name, specialty")
        .eq("user_id", userId)
        .maybeSingle();
      setProfile(profileRow);
      if (!profileRow) return;
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, customer_id, last_message_at")
        .eq("dietitian_profile_id", profileRow.id)
        .order("last_message_at", { ascending: false });
      setConversations(convs ?? []);
    })();
  }, [userId, isDietitian, rolesLoading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/expert");
    toast({ title: "Signed out" });
  };

  if (!userId || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary via-secondary to-primary text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/75">Expert Dashboard</p>
              <h1 className="text-xl font-bold">{profile?.full_name ?? email}</h1>
              {profile?.specialty && (
                <p className="text-xs text-primary-foreground/80">{profile.specialty}</p>
              )}
            </div>
          </div>
          <button onClick={handleSignOut} className="p-2 rounded-xl hover:bg-white/10">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 -mt-6 space-y-4 pb-12">
        {!isDietitian ? (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="p-5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Account pending verification</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Thanks for applying! Our team verifies every health expert before granting access.
                  You'll receive an email once your account is approved. This usually takes 1–2 business days.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !profile ? (
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="font-semibold text-sm">Complete your public profile</p>
              <p className="text-xs text-muted-foreground">
                Your account is verified, but you don't have a directory profile yet.
                Contact support to publish your profile to MacroMentor users.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Users className="w-3.5 h-3.5" /> Active clients
                  </div>
                  <p className="text-2xl font-bold">{conversations.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <MessageCircle className="w-3.5 h-3.5" /> Conversations
                  </div>
                  <p className="text-2xl font-bold">{conversations.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Conversations */}
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-sm mb-3">Recent conversations</h2>
                {conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No clients have reached out yet. Your profile is live in the directory.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/messages/${c.id}`)}
                        className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted text-left"
                      >
                        <div>
                          <p className="text-sm font-medium">Client</p>
                          <p className="text-[11px] text-muted-foreground">
                            Last activity {new Date(c.last_message_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Button variant="outline" className="w-full" onClick={() => navigate("/dietitians")}>
          View public directory
        </Button>
      </div>
    </div>
  );
};

export default ExpertDashboard;