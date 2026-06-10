import type { Trade } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Zap, Activity } from "lucide-react";

export function fmtUsd(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function fmtPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}
export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function MiniTradeRow({ trade }: { trade: Trade }) {
  const positive = trade.profitUsdt >= 0;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className={cn("w-1 h-8 rounded-full", positive ? "bg-bull" : "bg-bear")} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{trade.symbol}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            {trade.executionType === "LIMIT"
              ? <><Activity className="w-3 h-3" /> limit</>
              : <><Zap className="w-3 h-3 text-warn" /> market</>}
          </span>
        </div>
        <div className="text-xs text-muted-foreground tabular">
          ${fmtPrice(trade.entryPrice)} → ${fmtPrice(trade.exitPrice ?? trade.currentPrice ?? trade.entryPrice)}
        </div>
      </div>
      <div className="text-right">
        <div className={cn("text-sm font-semibold tabular", positive ? "text-bull" : "text-bear")}>
          {positive ? "+" : ""}{trade.profitPct.toFixed(2)}%
        </div>
        <div className="text-xs text-muted-foreground tabular">
          {positive ? "+" : ""}${fmtUsd(trade.profitUsdt)}
        </div>
      </div>
    </div>
  );
}
