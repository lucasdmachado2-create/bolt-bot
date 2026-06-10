import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Activity, History, Radar, BarChart3, Repeat2, Settings, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/trades", icon: Activity, label: "Trades em aberto" },
  { to: "/history", icon: History, label: "Histórico", disabled: true },
  { to: "/signals", icon: Radar, label: "Sinais", disabled: true },
  { to: "/performance", icon: BarChart3, label: "Performance", disabled: true },
  { to: "/dca", icon: Repeat2, label: "DCA", disabled: true },
  { to: "/settings", icon: Settings, label: "Configurações" },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface/40 backdrop-blur">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <div className="grid place-items-center w-9 h-9 rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
          <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">CryptoBot Pro</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Institutional</div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          const cls = cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            active
              ? "bg-accent text-foreground ring-1 ring-border-strong"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            item.disabled && "opacity-40 pointer-events-none",
          );
          return item.disabled ? (
            <div key={item.to} className={cls}>
              <Icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">soon</span>
            </div>
          ) : (
            <Link key={item.to} to={item.to} className={cls}>
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse-dot" />
          API conectada · Railway
        </div>
        <div className="mt-1 opacity-60">v0.1 · Fase 1</div>
      </div>
    </aside>
  );
}
