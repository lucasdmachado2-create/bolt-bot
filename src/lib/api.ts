/**
 * CryptoBot Pro — API client unificado
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("cbp_token") : null;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ───────────────── Types ─────────────────
export type BotMode = "PAPER" | "REAL";
export type MarketMode = "BULL" | "BEAR" | "LATERAL";

export interface BotStatus {
  running: boolean;
  mode: BotMode;
  marketMode: MarketMode;
  marketPulse: number;
  fearGreed: number;
  binanceConnected: boolean;
  apiLatencyMs: number;
  uptimeHours: number;
  btcOpenInterest: number;
  btcFundingRate: number;
  ethOpenInterest: number;
  ethFundingRate: number;
}

export interface EquityPoint { date: string; equity: number; pnl: number }

export interface PnlSummary {
  balanceUsdt: number;
  todayUsdt: number; todayPct: number;
  weekUsdt: number; weekPct: number;
  monthUsdt: number; monthPct: number;
  equityCurve: EquityPoint[];
}

export interface Trade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  status: "OPEN" | "CLOSED" | "CANCELLED" | "ERROR";
  mode: BotMode;
  executionType: "LIMIT" | "MARKET_FALLBACK";
  entryPrice: number;
  currentPrice?: number;
  exitPrice?: number;
  stopPrice: number;
  takeProfitPrice: number;
  trailingActive: boolean;
  atrAtEntry: number;
  quantity: number;
  positionSizeUsdt: number;
  profitUsdt: number;
  profitPct: number;
  closeReason?: "TAKE_PROFIT" | "STOP_LOSS" | "TRAILING" | "MANUAL" | "SAFETY_ORDER";
  safetyOrdersCount: number;
  openedAt: string;
  closedAt?: string;
}

export interface Settings {
  binanceApiKey: string;
  binanceApiSecret: string;
  whaleAlertKey: string;
  cryptoPanicKey: string;
  telegramToken: string;
  telegramChatId: string;
  reportEmail: string;
  defaultEntryUsdt: number;
  atrStopMultiplier: number;
  maxDailyLossPct: number;
  maxOpenTrades: number;
  safetyOrdersEnabled: boolean;
  dcaEnabled: boolean;
  realModeEnabled: boolean;
}

// ───────────────── API ─────────────────
export const api = {
  getStatus: () => request<BotStatus>("/api/bot/status"),
  toggleBot: (running: boolean) => request<BotStatus>("/api/bot/toggle", { method: "POST", body: JSON.stringify({ running }) }),
  setMode: (mode: BotMode) => request<BotStatus>("/api/bot/mode", { method: "POST", body: JSON.stringify({ mode }) }),
  getPnl: () => request<PnlSummary>("/api/pnl/summary"),
  getOpenTrades: () => request<Trade[]>("/api/trades/open"),
  getRecentTrades: () => request<Trade[]>("/api/trades/recent?limit=5"),
  closeTrade: (id: string) => request<Trade>(`/api/trades/${id}/close`, { method: "POST" }),
  getSettings: () => request<Settings>("/api/settings"),
  saveSettings: (s: Settings) => request<Settings>("/api/settings", { method: "PUT", body: JSON.stringify(s) }),
  testTelegram: () => request<{ ok: boolean }>("/api/settings/telegram/test", { method: "POST" }),
};
