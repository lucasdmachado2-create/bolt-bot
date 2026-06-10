import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: { value: number; suffix?: string };
  hint?: string;
  accent?: "default" | "bull" | "bear";
}

export function StatCard({ label, value, delta, hint, accent = "default" }: Props) {
  const positive = (delta?.value ?? 0) >= 0;
  return (
    <div className="surface-card p-5 relative overflow-hidden group">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          accent === "bull" && "bg-gradient-to-r from-transparent via-bull/60 to-transparent",
          accent === "bear" && "bg-gradient-to-r from-transparent via-bear/60 to-transparent",
          accent === "default" && "bg-gradient-to-r from-transparent via-primary/40 to-transparent",
        )}
      />
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl font-semibold tabular tracking-tight">{value}</div>
        {delta && (
          <div className={cn(
            "text-xs tabular flex items-center gap-0.5 mb-1",
            positive ? "text-bull" : "text-bear",
          )}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {positive ? "+" : ""}{delta.value.toFixed(2)}{delta.suffix ?? "%"}
          </div>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
