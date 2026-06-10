import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatCard } from "@/components/common/StatCard";
import { Gauge } from "@/components/common/Gauge";
import { EquityChart } from "@/components/common/EquityChart";
import { MiniTradeRow, fmtUsd } from "@/components/common/TradeRow";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CryptoBot Pro" },
      { name: "description", content: "Visão geral em tempo real: P&L, Market Pulse, Fear & Greed e últimos trades." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const status = useQuery({ queryKey: ["status"], queryFn: api.getStatus, refetchInterval: 5000 });
  const pnl = useQuery({ queryKey: ["pnl"], queryFn: api.getPnl, refetchInterval: 10000 });
  const recent = useQuery({ queryKey: ["recent"], queryFn: api.getRecentTrades, refetchInterval: 15000 });

  if (!status.data || !pnl.data) return <DashboardSkeleton />;

  const s = status.data;
  const p = pnl.data;
  const ModeIcon = s.marketMode === "BULL" ? TrendingUp : s.marketMode === "BEAR" ? TrendingDown : Minus;
  const modeColor = s.marketMode === "BULL" ? "text-bull" : s.marketMode === "BEAR" ? "text-bear" : "text-muted-foreground";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do bot em tempo real</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lucro hoje" value={`$${fmtUsd(p.todayUsdt)}`}
          delta={{ value: p.todayPct }} accent={p.todayUsdt >= 0 ? "bull" : "bear"} />
        <StatCard label="Lucro semana" value={`$${fmtUsd(p.weekUsdt)}`}
          delta={{ value: p.weekPct }} accent={p.weekUsdt >= 0 ? "bull" : "bear"} />
        <StatCard label="Lucro mês" value={`$${fmtUsd(p.monthUsdt)}`}
          delta={{ value: p.monthPct }} accent={p.monthUsdt >= 0 ? "bull" : "bear"} />
        <StatCard label="Saldo USDT" value={`$${fmtUsd(p.balanceUsdt)}`}
          hint={`Equity total · ${s.uptimeHours.toFixed(0)}h online`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><EquityChart data={p.equityCurve} /></div>
        <div className="space-y-4">
          <div className="surface-card p-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Modo de mercado</div>
            <div className={`mt-2 flex items-center gap-2 text-xl font-semibold ${modeColor}`}>
              <ModeIcon className="w-5 h-5" /> {s.marketMode}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <MetricRow label="BTC OI" value={`$${(s.btcOpenInterest / 1e9).toFixed(2)}B`} />
              <MetricRow label="BTC Funding" value={`${(s.btcFundingRate * 100).toFixed(3)}%`}
                tone={s.btcFundingRate > 0.001 ? "warn" : "default"} />
              <MetricRow label="ETH OI" value={`$${(s.ethOpenInterest / 1e9).toFixed(2)}B`} />
              <MetricRow label="ETH Funding" value={`${(s.ethFundingRate * 100).toFixed(3)}%`}
                tone={s.ethFundingRate > 0.001 ? "warn" : "default"} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Gauge value={s.marketPulse} label="Market Pulse Score"
          sublabel="F&G 25% · BTC.D 20% · vol 20% · breadth 20% · funding 15%" />
        <Gauge value={s.fearGreed} label="Fear & Greed Index"
          sublabel="Sentimento geral do mercado" />
        <div className="surface-card p-5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">Últimos trades</div>
          {recent.data?.slice(0, 5).map(t => <MiniTradeRow key={t.id} trade={t} />)}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warn" }) {
  return (
    <div className="flex justify-between items-baseline border-b border-border pb-1.5 last:border-0">
      <span className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</span>
      <span className={`tabular font-medium ${tone === "warn" ? "text-warn" : ""}`}>{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-48 bg-surface rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) =>
          <div key={i} className="h-28 bg-surface rounded-lg animate-pulse" />)}
      </div>
      <div className="h-80 bg-surface rounded-lg animate-pulse" />
    </div>
  );
}
