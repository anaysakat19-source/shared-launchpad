import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft, Star, MapPin, GraduationCap, Award, Globe, Mail, Phone, Languages,
  Briefcase, MessageCircle,
} from "lucide-react";

type Dietitian = {
  id: string;
  full_name: string;
  specialty: string;
  years_experience: number;
  education: string;
  certifications: string[] | null;
  languages: string[] | null;
  location: string | null;
  bio: string;
  hourly_rate_inr: number | null;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  rating: number | null;
  is_available: boolean;
  photo_url: string | null;
};

const DietitianDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dietitian, setDietitian] = useState<Dietitian | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      void load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("dietitian_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Not found", description: "We couldn't find that dietitian.", variant: "destructive" });
      navigate("/dietitians");
      return;
    }
    setDietitian(data as Dietitian);
    setLoading(false);
  };

  const startConversation = async () => {
    if (!dietitian || !userId) return;
    setStarting(true);
    // Find existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("customer_id", userId)
      .eq("dietitian_profile_id", dietitian.id)
      .maybeSingle();
    if (existing?.id) {
      navigate(`/messages/${existing.id}`);
      return;
    }
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ customer_id: userId, dietitian_profile_id: dietitian.id })
      .select("id")
      .single();
    setStarting(false);
    if (error || !created) {
      toast({ title: "Could not start chat", description: error?.message ?? "Try again later.", variant: "destructive" });
      return;
    }
    navigate(`/messages/${created.id}`);
  };

  if (loading || !dietitian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-32">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground px-5 pt-8 pb-14 rounded-b-[2rem] relative">
          <button
            onClick={() => navigate("/dietitians")}
            className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> All dietitians
          </button>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {dietitian.full_name
                .split(" ")
                .filter((p) => !p.endsWith("."))
                .slice(0, 2)
                .map((p) => p[0])
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight truncate">{dietitian.full_name}</h1>
              <p className="text-sm text-primary-foreground/85 truncate">{dietitian.specialty}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                {dietitian.rating !== null && (
                  <span className="flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    {Number(dietitian.rating).toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {dietitian.years_experience} yrs
                </span>
                {dietitian.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {dietitian.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-5 -mt-8 space-y-4 relative z-10">
          {/* About */}
          <Card>
            <CardContent className="p-5 space-y-2">
              <h2 className="font-semibold text-sm">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{dietitian.bio}</p>
              {dietitian.is_available ? (
                <Badge className="bg-primary/10 text-primary mt-1">Accepting new clients</Badge>
              ) : (
                <Badge variant="outline" className="mt-1">Currently unavailable</Badge>
              )}
            </CardContent>
          </Card>

          {/* Education & Certifications */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Education</p>
                  <p className="text-sm font-medium">{dietitian.education}</p>
                </div>
              </div>

              {(dietitian.certifications ?? []).length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1.5">Certifications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dietitian.certifications!.map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(dietitian.languages ?? []).length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary mt-0.5">
                    <Languages className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1.5">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dietitian.languages!.map((l) => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold text-sm">Contact</h2>
              <div className="space-y-2 text-sm">
                <a
                  href={`mailto:${dietitian.contact_email}`}
                  className="flex items-center gap-3 text-foreground hover:text-primary"
                >
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {dietitian.contact_email}
                </a>
                {dietitian.contact_phone && (
                  <a
                    href={`tel:${dietitian.contact_phone}`}
                    className="flex items-center gap-3 text-foreground hover:text-primary"
                  >
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {dietitian.contact_phone}
                  </a>
                )}
                {dietitian.website && (
                  <a
                    href={dietitian.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-foreground hover:text-primary truncate"
                  >
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    {dietitian.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
              {dietitian.hourly_rate_inr && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Consultation rate: <span className="font-semibold text-foreground">₹{dietitian.hourly_rate_inr}</span> per session
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-16 left-0 right-0 px-5 pb-3 pt-3 bg-gradient-to-t from-background via-background to-transparent z-40">
          <div className="max-w-3xl mx-auto">
            <Button onClick={startConversation} disabled={starting} className="w-full h-12 text-base shadow-lg" size="lg">
              <MessageCircle className="w-5 h-5" />
              {starting ? "Opening chat..." : `Message ${dietitian.full_name.split(" ")[0]}`}
            </Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default DietitianDetail;