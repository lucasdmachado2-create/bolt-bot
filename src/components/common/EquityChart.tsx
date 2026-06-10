import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EquityPoint } from "@/lib/api";

export function EquityChart({ data }: { data: EquityPoint[] }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Equity Curve</div>
          <div className="text-xs text-muted-foreground">Últimos 30 dias</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold tabular">${data.at(-1)?.equity.toLocaleString("en-US")}</div>
          <div className="text-xs text-bull tabular">+${data.at(-1)?.pnl.toLocaleString("en-US")}</div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              axisLine={false} tickLine={false} width={50}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number) => [`$${v.toLocaleString("en-US")}`, "Equity"]} />
            <Area type="monotone" dataKey="equity" stroke="var(--primary)" strokeWidth={2}
              fill="url(#eq)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
