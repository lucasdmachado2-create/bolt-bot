import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Trade } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { fmtPrice, fmtUsd, timeAgo } from "@/components/common/TradeRow";
import { cn } from "@/lib/utils";
import { Activity, Zap, ShieldAlert, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/trades")({
  head: () => ({
    meta: [
      { title: "Trades em aberto — CryptoBot Pro" },
      { name: "description", content: "Posições abertas em tempo real, stops ATR, trailing e take-profits." },
    ],
  }),
  component: TradesPage,
});

function TradesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["trades", "open"],
    queryFn: api.getOpenTrades,
    refetchInterval: 4000,
  });

  const close = useMutation({
    mutationFn: (id: string) => api.closeTrade(id),
    onSuccess: () => {
      toast.success("Posição encerrada");
      qc.invalidateQueries({ queryKey: ["trades", "open"] });
      qc.invalidateQueries({ queryKey: ["pnl"] });
    },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Trades em aberto</h1>
        <p className="text-sm text-muted-foreground">
          {data?.length ?? 0} posição{(data?.length ?? 0) !== 1 ? "es" : ""} sendo monitorada{(data?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </header>

      {isLoading && <div className="h-40 surface-card animate-pulse" />}
      {!isLoading && data?.length === 0 && (
        <div className="surface-card p-12 text-center">
          <Target className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground">Nenhuma posição aberta no momento.</div>
          <div className="text-xs text-muted-foreground/60 mt-1">O bot aguardará o próximo sinal qualificado.</div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {data?.map((t) => (
          <TradeCard key={t.id} trade={t} onClose={() => close.mutate(t.id)} />
        ))}
      </div>
    </div>
  );
}

function TradeCard({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const positive = trade.profitUsdt >= 0;
  const current = trade.currentPrice ?? trade.entryPrice;
  const stopDistPct = ((current - trade.stopPrice) / current) * 100;
  const tpDistPct = ((trade.takeProfitPrice - current) / current) * 100;

  return (
    <div className="surface-card overflow-hidden">
      <div className={cn("h-1 w-full", positive ? "bg-bull" : "bg-bear")} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{trade.symbol}</h3>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                {trade.executionType === "LIMIT"
                  ? <><Activity className="w-3 h-3" /> limit</>
                  : <><Zap className="w-3 h-3 text-warn" /> market fallback</>}
              </span>
              {trade.trailingActive && (
                <span className="text-[10px] uppercase tracking-wider text-info flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> trailing
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Aberto há {timeAgo(trade.openedAt)} · ${fmtUsd(trade.positionSizeUsdt)} alocado · qty {trade.quantity}
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-2xl font-semibold tabular", positive ? "text-bull" : "text-bear")}>
              {positive ? "+" : ""}{trade.profitPct.toFixed(2)}%
            </div>
            <div className={cn("text-xs tabular", positive ? "text-bull" : "text-bear")}>
              {positive ? "+" : ""}${fmtUsd(trade.profitUsdt)}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <PriceBox label="Entrada" value={fmtPrice(trade.entryPrice)} />
          <PriceBox label="Atual" value={fmtPrice(current)} highlight />
          <PriceBox label="Take-profit" value={fmtPrice(trade.takeProfitPrice)} sub={`+${tpDistPct.toFixed(2)}%`} tone="bull" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <PriceBox label="Stop ATR" value={fmtPrice(trade.stopPrice)} sub={`${stopDistPct.toFixed(2)}% abaixo · ATR ${trade.atrAtEntry.toFixed(2)}`} tone="bear" />
          <PriceBox label="Safety orders" value={`${trade.safetyOrdersCount} / 2`}
            sub={trade.safetyOrdersCount > 0 ? "DCA ativo" : "Aguardando"} />
        </div>

        <PriceBar trade={trade} current={current} />

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="w-3.5 h-3.5" /> Risco máx: 1% do equity
          </div>
          <ConfirmDialog
            trigger={<Button variant="outline" size="sm" className="border-bear/40 text-bear hover:bg-bear-soft">Vender agora</Button>}
            title={`Encerrar posição ${trade.symbol}?`}
            description={
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2 mt-2 p-3 rounded-md bg-surface/60">
                  <Field label="Entrada" value={`$${fmtPrice(trade.entryPrice)}`} />
                  <Field label="Atual" value={`$${fmtPrice(current)}`} />
                  <Field label="P&L %" value={`${positive ? "+" : ""}${trade.profitPct.toFixed(2)}%`} tone={positive ? "bull" : "bear"} />
                  <Field label="P&L USDT" value={`${positive ? "+" : ""}$${fmtUsd(trade.profitUsdt)}`} tone={positive ? "bull" : "bear"} />
                </div>
                <div className="text-xs text-muted-foreground">A ordem será registrada com motivo MANUAL.</div>
              </div>
            }
            confirmLabel="Vender agora"
            destructive
            onConfirm={onClose}
          />
        </div>
      </div>
    </div>
  );
}

function PriceBox({ label, value, sub, tone, highlight }: {
  label: string; value: string; sub?: string; tone?: "bull" | "bear"; highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-md p-2.5 border border-border",
      highlight ? "bg-surface-elevated ring-1 ring-primary/20" : "bg-surface/50",
    )}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("tabular font-medium mt-0.5",
        tone === "bull" && "text-bull", tone === "bear" && "text-bear")}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground tabular mt-0.5">{sub}</div>}
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-sm tabular font-medium",
        tone === "bull" && "text-bull", tone === "bear" && "text-bear")}>{value}</div>
    </div>
  );
}

function PriceBar({ trade, current }: { trade: Trade; current: number }) {
  const lo = trade.stopPrice;
  const hi = trade.takeProfitPrice;
  const range = hi - lo;
  const pos = Math.max(0, Math.min(1, (current - lo) / range)) * 100;
  const entryPos = Math.max(0, Math.min(1, (trade.entryPrice - lo) / range)) * 100;
  return (
    <div className="mt-4">
      <div className="relative h-2 rounded-full bg-gradient-to-r from-bear-soft via-muted to-bull-soft">
        <div className="absolute -top-1 w-0.5 h-4 bg-muted-foreground/60" style={{ left: `${entryPos}%` }} />
        <div className="absolute -top-1.5 w-1 h-5 rounded-full bg-primary ring-2 ring-background"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground tabular mt-1.5">
        <span>SL ${fmtPrice(lo)}</span>
        <span>entrada</span>
        <span>TP ${fmtPrice(hi)}</span>
      </div>
    </div>
  );
}
