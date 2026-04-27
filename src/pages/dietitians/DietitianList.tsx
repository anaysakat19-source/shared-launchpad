import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Search, Star, MapPin, Stethoscope } from "lucide-react";

type Dietitian = {
  id: string;
  full_name: string;
  specialty: string;
  years_experience: number;
  location: string | null;
  bio: string;
  rating: number | null;
  hourly_rate_inr: number | null;
  photo_url: string | null;
  is_available: boolean;
  languages: string[] | null;
};

const DietitianList = () => {
  const navigate = useNavigate();
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      void load();
    });
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("dietitian_profiles")
      .select("id, full_name, specialty, years_experience, location, bio, rating, hourly_rate_inr, photo_url, is_available, languages")
      .order("rating", { ascending: false });
    setDietitians(data ?? []);
    setLoading(false);
  };

  const filtered = dietitians.filter((d) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      d.full_name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      (d.location ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-secondary via-secondary to-primary text-primary-foreground px-5 pt-8 pb-10 rounded-b-[2rem]">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-white/15">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Talk to a Dietitian</h1>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Hand-picked, certified nutrition experts ready to guide your journey.
          </p>

          <div className="relative mt-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, specialty, city..."
              className="pl-9 bg-card text-foreground"
              maxLength={100}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 pt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading experts...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No dietitians match your search.</p>
          ) : (
            filtered.map((d) => (
              <Card
                key={d.id}
                className="cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
                onClick={() => navigate(`/dietitians/${d.id}`)}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                    {d.full_name
                      .split(" ")
                      .filter((p) => !p.endsWith("."))
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{d.full_name}</p>
                        <p className="text-xs text-primary font-medium truncate">{d.specialty}</p>
                      </div>
                      {d.rating !== null && (
                        <div className="flex items-center gap-0.5 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                          {Number(d.rating).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{d.bio}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>{d.years_experience} yrs exp</span>
                      {d.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {d.location}
                        </span>
                      )}
                      {d.hourly_rate_inr && <span>₹{d.hourly_rate_inr}/session</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {d.is_available ? (
                        <Badge variant="secondary" className="text-[10px] py-0 bg-primary/10 text-primary">
                          Available now
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0">
                          Busy
                        </Badge>
                      )}
                      {(d.languages ?? []).slice(0, 2).map((lang) => (
                        <Badge key={lang} variant="outline" className="text-[10px] py-0">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => navigate("/expert")}>
            Are you a dietitian? Sign in here
          </Button>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default DietitianList;