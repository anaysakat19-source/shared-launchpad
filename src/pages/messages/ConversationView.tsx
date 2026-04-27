import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  conversation_id: string;
};

type Header = {
  full_name: string;
  specialty: string;
};

const ConversationView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [header, setHeader] = useState<Header | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      const { data: convo } = await supabase
        .from("conversations")
        .select("dietitian_profiles(full_name, specialty)")
        .eq("id", id)
        .maybeSingle();
      if (convo?.dietitian_profiles) {
        setHeader(convo.dietitian_profiles as unknown as Header);
      }

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      setMessages(msgs ?? []);
    });

    // Realtime
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          setMessages((prev) => {
            const next = payload.new as Message;
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !id || !userId) return;
    if (text.length > 2000) {
      toast({ title: "Message too long", description: "Keep it under 2000 characters.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: userId,
      body: text,
    });
    if (!error) {
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", id);
      setBody("");
    } else {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm">
          {(header?.full_name ?? "?")
            .split(" ")
            .filter((p) => !p.endsWith("."))
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{header?.full_name ?? "Dietitian"}</p>
          <p className="text-[11px] text-muted-foreground truncate">{header?.specialty}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-10">
            Say hello — start the conversation 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    mine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form onSubmit={send} className="p-3 border-t border-border bg-card flex items-center gap-2 sticky bottom-0">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1"
        />
        <Button type="submit" disabled={sending || !body.trim()} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ConversationView;