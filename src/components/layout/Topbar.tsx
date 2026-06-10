import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, USING_MOCKS } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Power, PowerOff, Wifi, Clock } from "lucide-react";
import { toast } from "sonner";
import { ModeBadge } from "../common/ModeBadge";

export function Topbar() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["status"], queryFn: api.getStatus, refetchInterval: 5000 });
  const toggle = useMutation({
    mutationFn: (running: boolean) => api.toggleBot(running),
    onSuccess: (s) => {
      qc.setQueryData(["status"], s);
      toast.success(s.running ? "Bot iniciado" : "Bot pausado");
    },
  });

  if (!data) return <div className="h-16 border-b border-border bg-surface/40" />;

  return (
    <header className="h-16 shrink-0 border-b border-border bg-surface/40 backdrop-blur px-6 flex items-center gap-4">
      <ModeBadge mode={data.mode} />
      <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Wifi className={`w-3.5 h-3.5 ${data.binanceConnected ? "text-bull" : "text-bear"}`} />
          Binance {data.binanceConnected ? "online" : "offline"} · {data.apiLatencyMs}ms
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          uptime {data.uptimeHours.toFixed(1)}h
        </span>
        {USING_MOCKS && (
          <span className="text-warn text-[11px] uppercase tracking-wider">
            modo mock · defina VITE_API_URL
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</div>
          <div className="text-sm font-medium flex items-center gap-1.5 justify-end">
            <span className={`w-1.5 h-1.5 rounded-full ${data.running ? "bg-bull animate-pulse-dot" : "bg-muted-foreground"}`} />
            {data.running ? "Rodando" : "Pausado"}
          </div>
        </div>
        <Button
          variant={data.running ? "outline" : "default"}
          size="sm"
          onClick={() => toggle.mutate(!data.running)}
          disabled={toggle.isPending}
          className={data.running ? "" : "bg-bull text-background hover:bg-bull/90"}
        >
          {data.running ? <><PowerOff className="w-4 h-4 mr-1.5" /> Pausar</> : <><Power className="w-4 h-4 mr-1.5" /> Iniciar</>}
        </Button>
      </div>
    </header>
  );
}
