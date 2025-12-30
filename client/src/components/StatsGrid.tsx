import { useBotStatus } from "@/hooks/use-bot";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MapPin, Users, Wifi, Heart, Drumstick } from "lucide-react";
import { motion } from "framer-motion";

export function StatsGrid() {
  const { data: status, isLoading } = useBotStatus();

  if (isLoading || !status) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-secondary/50 rounded-none border border-primary/20" />
        ))}
      </div>
    );
  }

  const isDanger = status.nearbyPlayers > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CONNECTION STATUS */}
      <Card className="bg-card border-primary/30 shadow-[0_0_15px_rgba(0,255,0,0.1)] rounded-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-tech text-muted-foreground flex items-center gap-2">
            <Wifi className="w-4 h-4" /> CONNECTION_LINK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${status.online ? 'bg-primary shadow-[0_0_10px_#0f0]' : 'bg-destructive shadow-[0_0_10px_red]'}`} />
            <span className={`text-2xl font-bold font-mono ${status.online ? 'text-primary' : 'text-destructive'}`}>
              {status.online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Ping: {status.online ? '24ms' : '---'}
          </p>
        </CardContent>
      </Card>

      {/* VITALS */}
      <Card className="bg-card border-primary/30 shadow-[0_0_15px_rgba(0,255,0,0.1)] rounded-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-tech text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> BIOMETRICS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="flex items-center gap-1 text-primary"><Heart className="w-3 h-3" /> HP</span>
              <span>{Math.round(status.health)}/20</span>
            </div>
            <Progress value={(status.health / 20) * 100} className="h-1.5 bg-secondary" indicatorClassName="bg-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="flex items-center gap-1 text-yellow-500"><Drumstick className="w-3 h-3" /> HUNGER</span>
              <span>{Math.round(status.food)}/20</span>
            </div>
            <Progress value={(status.food / 20) * 100} className="h-1.5 bg-secondary" indicatorClassName="bg-yellow-500" />
          </div>
        </CardContent>
      </Card>

      {/* POSITION */}
      <Card className="bg-card border-primary/30 shadow-[0_0_15px_rgba(0,255,0,0.1)] rounded-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-tech text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" /> GEOLOCATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status.position ? (
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-secondary/50 p-2 border border-primary/20">
                <div className="text-[10px] text-muted-foreground">X</div>
                <div className="text-primary">{Math.round(status.position.x)}</div>
              </div>
              <div className="bg-secondary/50 p-2 border border-primary/20">
                <div className="text-[10px] text-muted-foreground">Y</div>
                <div className="text-primary">{Math.round(status.position.y)}</div>
              </div>
              <div className="bg-secondary/50 p-2 border border-primary/20">
                <div className="text-[10px] text-muted-foreground">Z</div>
                <div className="text-primary">{Math.round(status.position.z)}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono">
              [NO SIGNAL]
            </div>
          )}
        </CardContent>
      </Card>

      {/* THREAT LEVEL */}
      <Card className={`bg-card rounded-none transition-colors duration-500 ${isDanger ? 'border-destructive shadow-[0_0_20px_rgba(255,0,0,0.3)] animate-pulse' : 'border-primary/30 shadow-[0_0_15px_rgba(0,255,0,0.1)]'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-tech text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> THREAT_LEVEL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold font-mono tracking-tighter">
              {String(status.nearbyPlayers).padStart(2, '0')}
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${isDanger ? 'text-destructive' : 'text-primary'}`}>
                {isDanger ? 'CRITICAL' : 'SAFE'}
              </div>
              <div className="text-xs text-muted-foreground font-mono">ENTITIES NEARBY</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
