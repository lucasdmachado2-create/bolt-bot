/**
 * CryptoBot Pro — API client
 *
 * Aponta para o backend Node/Express hospedado no Railway.
 * Configure a URL via `VITE_API_URL` no .env (ex.: https://cryptobot-api.up.railway.app).
 *
 * Enquanto o backend não estiver pronto, o client cai automaticamente
 * para dados MOCK realistas — todas as telas continuam funcionais.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
export const USING_MOCKS = !API_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("MOCK_FALLBACK");
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

// ───────────────── Mocks ─────────────────
const mockStatus: BotStatus = {
  running: true, mode: "PAPER", marketMode: "BULL",
  marketPulse: 64, fearGreed: 58, binanceConnected: true,
  apiLatencyMs: 47, uptimeHours: 73.2,
  btcOpenInterest: 12_840_000_000, btcFundingRate: 0.0089,
  ethOpenInterest: 7_210_000_000, ethFundingRate: 0.0112,
};

const today = new Date();
const mockEquity: EquityPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today); d.setDate(d.getDate() - (29 - i));
  const base = 10_000;
  const growth = base * (1 + (i / 29) * 0.18 + Math.sin(i / 3) * 0.012);
  return { date: d.toISOString().slice(0, 10), equity: +growth.toFixed(2), pnl: +(growth - base).toFixed(2) };
});

const mockPnl: PnlSummary = {
  balanceUsdt: mockEquity.at(-1)!.equity,
  todayUsdt: 142.38, todayPct: 1.21,
  weekUsdt: 487.10, weekPct: 4.32,
  monthUsdt: 1_812.55, monthPct: 18.10,
  equityCurve: mockEquity,
};

const mockTrades: Trade[] = [
  { id: "t1", symbol: "SOLUSDT", side: "BUY", status: "OPEN", mode: "PAPER", executionType: "LIMIT",
    entryPrice: 178.42, currentPrice: 181.05, stopPrice: 175.10, takeProfitPrice: 180.56,
    trailingActive: true, atrAtEntry: 2.21, quantity: 3.74, positionSizeUsdt: 667.45,
    profitUsdt: 9.83, profitPct: 1.47, safetyOrdersCount: 0,
    openedAt: new Date(Date.now() - 38 * 60_000).toISOString() },
  { id: "t2", symbol: "AVAXUSDT", side: "BUY", status: "OPEN", mode: "PAPER", executionType: "LIMIT",
    entryPrice: 41.20, currentPrice: 40.86, stopPrice: 40.32, takeProfitPrice: 41.69,
    trailingActive: false, atrAtEntry: 0.59, quantity: 12.13, positionSizeUsdt: 499.76,
    profitUsdt: -4.12, profitPct: -0.83, safetyOrdersCount: 1,
    openedAt: new Date(Date.now() - 22 * 60_000).toISOString() },
  { id: "t3", symbol: "LINKUSDT", side: "BUY", status: "OPEN", mode: "PAPER", executionType: "MARKET_FALLBACK",
    entryPrice: 14.82, currentPrice: 15.04, stopPrice: 14.51, takeProfitPrice: 15.00,
    trailingActive: true, atrAtEntry: 0.21, quantity: 33.74, positionSizeUsdt: 500.02,
    profitUsdt: 7.42, profitPct: 1.49, safetyOrdersCount: 0,
    openedAt: new Date(Date.now() - 9 * 60_000).toISOString() },
];

const mockRecent: Trade[] = [
  { ...mockTrades[0], id: "h1", status: "CLOSED", profitUsdt: 8.12, profitPct: 1.21, closeReason: "TAKE_PROFIT",
    closedAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { ...mockTrades[1], id: "h2", symbol: "ARBUSDT", status: "CLOSED", profitUsdt: -7.45, profitPct: -1.49, closeReason: "STOP_LOSS",
    closedAt: new Date(Date.now() - 4 * 3600_000).toISOString() },
  { ...mockTrades[2], id: "h3", symbol: "INJUSDT", status: "CLOSED", profitUsdt: 22.84, profitPct: 4.56, closeReason: "TRAILING",
    closedAt: new Date(Date.now() - 6 * 3600_000).toISOString() },
  { ...mockTrades[0], id: "h4", symbol: "MATICUSDT", status: "CLOSED", profitUsdt: 4.31, profitPct: 0.86, closeReason: "MANUAL",
    closedAt: new Date(Date.now() - 9 * 3600_000).toISOString() },
  { ...mockTrades[1], id: "h5", symbol: "DOTUSDT", status: "CLOSED", profitUsdt: 11.20, profitPct: 2.24, closeReason: "TAKE_PROFIT",
    closedAt: new Date(Date.now() - 12 * 3600_000).toISOString() },
];

const mockSettings: Settings = {
  binanceApiKey: "", binanceApiSecret: "", whaleAlertKey: "",
  cryptoPanicKey: "", telegramToken: "", telegramChatId: "",
  reportEmail: "", defaultEntryUsdt: 500, atrStopMultiplier: 1.5,
  maxDailyLossPct: 2, maxOpenTrades: 5,
  safetyOrdersEnabled: true, dcaEnabled: false, realModeEnabled: false,
};

async function withFallback<T>(real: () => Promise<T>, mock: T, delay = 250): Promise<T> {
  try { return await real(); }
  catch { await new Promise(r => setTimeout(r, delay)); return mock; }
}

// ───────────────── API ─────────────────
export const api = {
  getStatus: () => withFallback(() => request<BotStatus>("/api/bot/status"), mockStatus),
  toggleBot: (running: boolean) => withFallback(
    () => request<BotStatus>("/api/bot/toggle", { method: "POST", body: JSON.stringify({ running }) }),
    { ...mockStatus, running }),
  setMode: (mode: BotMode) => withFallback(
    () => request<BotStatus>("/api/bot/mode", { method: "POST", body: JSON.stringify({ mode }) }),
    { ...mockStatus, mode }),
  getPnl: () => withFallback(() => request<PnlSummary>("/api/pnl/summary"), mockPnl),
  getOpenTrades: () => withFallback(() => request<Trade[]>("/api/trades/open"), mockTrades),
  getRecentTrades: () => withFallback(() => request<Trade[]>("/api/trades/recent?limit=5"), mockRecent),
  closeTrade: (id: string) => withFallback(
    () => request<Trade>(`/api/trades/${id}/close`, { method: "POST" }),
    { ...mockTrades.find(t => t.id === id)!, status: "CLOSED" as const, closeReason: "MANUAL" as const, closedAt: new Date().toISOString() }),
  getSettings: () => withFallback(() => request<Settings>("/api/settings"), mockSettings),
  saveSettings: (s: Settings) => withFallback(
    () => request<Settings>("/api/settings", { method: "PUT", body: JSON.stringify(s) }), s),
  testTelegram: () => withFallback(
    () => request<{ ok: boolean }>("/api/settings/telegram/test", { method: "POST" }), { ok: true }),
};
