import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { Watch, Smartphone, Heart, Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface WearableDevice {
  id: string;
  name: string;
  brand: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  connected: boolean;
}

const defaultDevices: WearableDevice[] = [
  {
    id: "apple-watch",
    name: "Apple Watch",
    brand: "Apple",
    icon: <Watch className="h-8 w-8" />,
    description: "Sync steps, heart rate, calories burned, and workouts.",
    features: ["Steps", "Heart Rate", "Calories", "Sleep"],
    connected: false,
  },
  {
    id: "fitbit",
    name: "Fitbit",
    brand: "Fitbit",
    icon: <Activity className="h-8 w-8" />,
    description: "Track activity, sleep patterns, and heart rate zones.",
    features: ["Steps", "Sleep", "Heart Rate", "SpO2"],
    connected: false,
  },
  {
    id: "samsung-galaxy-watch",
    name: "Galaxy Watch",
    brand: "Samsung",
    icon: <Watch className="h-8 w-8" />,
    description: "Monitor fitness metrics and body composition.",
    features: ["Steps", "Heart Rate", "Body Comp", "Sleep"],
    connected: false,
  },
  {
    id: "oura-ring",
    name: "Oura Ring",
    brand: "Oura",
    icon: <Heart className="h-8 w-8" />,
    description: "Advanced sleep tracking and readiness scores.",
    features: ["Sleep", "Readiness", "Heart Rate", "Temperature"],
    connected: false,
  },
  {
    id: "google-fit",
    name: "Google Fit",
    brand: "Google",
    icon: <Smartphone className="h-8 w-8" />,
    description: "Aggregate health data from your Android phone and apps.",
    features: ["Steps", "Heart Points", "Calories", "Distance"],
    connected: false,
  },
  {
    id: "mi-band",
    name: "Mi Band / Smart Band",
    brand: "Xiaomi",
    icon: <Activity className="h-8 w-8" />,
    description: "Budget-friendly fitness tracking with long battery life.",
    features: ["Steps", "Heart Rate", "Sleep", "SpO2"],
    connected: false,
  },
];

const Wearables = () => {
  const [devices, setDevices] = useState<WearableDevice[]>(defaultDevices);
  const navigate = useNavigate();

  const handleToggleConnect = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const newState = !d.connected;
          toast.success(
            newState
              ? `${d.name} connected! (Demo — real sync coming soon)`
              : `${d.name} disconnected.`
          );
          return { ...d, connected: newState };
        }
        return d;
      })
    );
  };

  const connectedCount = devices.filter((d) => d.connected).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 pb-24">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Connect Wearables</h1>
            <p className="text-muted-foreground mt-1">
              Link your smart devices to sync health data automatically.
            </p>
            {connectedCount > 0 && (
              <Badge variant="secondary" className="mt-2">
                {connectedCount} device{connectedCount > 1 ? "s" : ""} connected
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {devices.map((device) => (
              <Card
                key={device.id}
                className={`transition-all ${device.connected ? "border-primary/50 shadow-md" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          device.connected
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {device.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {device.brand}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant={device.connected ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleConnect(device.id)}
                    >
                      {device.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {device.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {device.features.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Real-time wearable sync is coming soon. This is a preview of supported devices.
          </p>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Wearables;
