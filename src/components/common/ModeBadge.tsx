import { ShieldCheck, FlaskConical } from "lucide-react";
import type { BotMode } from "@/lib/api";

export function ModeBadge({ mode }: { mode: BotMode }) {
  if (mode === "REAL") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bull-soft text-bull text-[11px] font-semibold uppercase tracking-wider ring-1 ring-bull/30">
        <ShieldCheck className="w-3.5 h-3.5" /> Real
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warn-soft text-warn text-[11px] font-semibold uppercase tracking-wider ring-1 ring-warn/30">
      <FlaskConical className="w-3.5 h-3.5" /> Paper Trading
    </div>
  );
}
