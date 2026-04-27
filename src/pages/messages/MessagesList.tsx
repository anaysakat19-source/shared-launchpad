import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, MessageCircle } from "lucide-react";

type Row = {
  id: string;
  last_message_at: string;
  customer_id: string;
  dietitian_profile_id: string;
  dietitian_profiles: { full_name: string; specialty: string } | null;
};

const MessagesList = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("conversations")
        .select("id, last_message_at, customer_id, dietitian_profile_id, dietitian_profiles(full_name, specialty)")
        .order("last_message_at", { ascending: false });
      setRows((data ?? []) as unknown as Row[]);
      setLoading(false);
    });
  }, [navigate]);

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground px-5 pt-8 pb-8 rounded-b-[2rem]">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
          <p className="text-sm text-primary-foreground/80">Your chats with dietitians</p>
        </div>

        <div className="max-w-3xl mx-auto px-5 pt-5 space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : rows.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <button
                  onClick={() => navigate("/dietitians")}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Browse dietitians →
                </button>
              </CardContent>
            </Card>
          ) : (
            rows.map((r) => (
              <Card
                key={r.id}
                className="cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => navigate(`/messages/${r.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                    {(r.dietitian_profiles?.full_name ?? "?")
                      .split(" ")
                      .filter((p) => !p.endsWith("."))
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {r.dietitian_profiles?.full_name ?? "Dietitian"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.dietitian_profiles?.specialty}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(r.last_message_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default MessagesList;