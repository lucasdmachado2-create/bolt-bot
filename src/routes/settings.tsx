import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, type Settings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { Key, Bell, Sliders, ShieldAlert, Send, Lock } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — CryptoBot Pro" },
      { name: "description", content: "API keys, parâmetros de risco, notificações e modo real." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });
  const [form, setForm] = useState<Settings | null>(null);
  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);

  const save = useMutation({
    mutationFn: (s: Settings) => api.saveSettings(s),
    onSuccess: (s) => { qc.setQueryData(["settings"], s); toast.success("Configurações salvas"); },
  });
  const test = useMutation({
    mutationFn: api.testTelegram,
    onSuccess: (r) => r.ok ? toast.success("Mensagem enviada no Telegram") : toast.error("Falha ao enviar"),
  });

  if (!form) return <div className="p-8"><div className="h-96 surface-card animate-pulse" /></div>;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm({ ...form, [k]: v });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Credenciais, parâmetros de risco e notificações</p>
      </header>

      <Section icon={Key} title="Binance API" hint="Apenas permissão de TRADING — saque nunca deve ser habilitado.">
        <Row label="API Key">
          <Input type="password" value={form.binanceApiKey} placeholder="••••••••••••••••••"
            onChange={(e) => set("binanceApiKey", e.target.value)} />
        </Row>
        <Row label="API Secret">
          <Input type="password" value={form.binanceApiSecret} placeholder="••••••••••••••••••"
            onChange={(e) => set("binanceApiSecret", e.target.value)} />
        </Row>
        <div className="flex items-start gap-2 p-3 rounded-md bg-warn-soft text-warn text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>IP Whitelist obrigatório.</strong> Configure na Binance o IP do servidor Railway.
            Chaves são criptografadas com AES-256 no banco e nunca expostas no frontend.
          </div>
        </div>
      </Section>

      <Section icon={Bell} title="APIs de dados externos">
        <Row label="Whale Alert API Key">
          <Input value={form.whaleAlertKey} onChange={(e) => set("whaleAlertKey", e.target.value)} />
        </Row>
        <Row label="CryptoPanic API Key">
          <Input value={form.cryptoPanicKey} onChange={(e) => set("cryptoPanicKey", e.target.value)} />
        </Row>
      </Section>

      <Section icon={Send} title="Notificações">
        <Row label="Token do Bot Telegram">
          <Input value={form.telegramToken} onChange={(e) => set("telegramToken", e.target.value)} />
        </Row>
        <Row label="Chat ID Telegram">
          <div className="flex gap-2">
            <Input value={form.telegramChatId} onChange={(e) => set("telegramChatId", e.target.value)} />
            <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
              Testar
            </Button>
          </div>
        </Row>
        <Row label="E-mail para relatório semanal">
          <Input type="email" value={form.reportEmail} placeholder="voce@email.com"
            onChange={(e) => set("reportEmail", e.target.value)} />
        </Row>
      </Section>

      <Section icon={Sliders} title="Parâmetros de risco">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Row label="Valor padrão de entrada (USDT)">
            <Input type="number" value={form.defaultEntryUsdt}
              onChange={(e) => set("defaultEntryUsdt", +e.target.value)} />
          </Row>
          <Row label="Multiplicador ATR para stop">
            <Input type="number" step="0.1" value={form.atrStopMultiplier}
              onChange={(e) => set("atrStopMultiplier", +e.target.value)} />
          </Row>
          <Row label="Stop diário máximo (%)">
            <Input type="number" step="0.1" value={form.maxDailyLossPct}
              onChange={(e) => set("maxDailyLossPct", +e.target.value)} />
          </Row>
          <Row label="Máx. trades simultâneos">
            <Input type="number" value={form.maxOpenTrades}
              onChange={(e) => set("maxOpenTrades", +e.target.value)} />
          </Row>
        </div>
        <Toggle label="Safety Orders (DCA recuperação)"
          desc="Até 2 ordens DCA quando preço cair -0.8% e -1.6%"
          checked={form.safetyOrdersEnabled} onChange={(v) => set("safetyOrdersEnabled", v)} />
        <Toggle label="Modo DCA (acumulação longo prazo)"
          desc="Compras programadas independentes do trading ativo"
          checked={form.dcaEnabled} onChange={(v) => set("dcaEnabled", v)} />
      </Section>

      <Section icon={Lock} title="Modo de execução" hint="Alternar para REAL requer confirmação explícita.">
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border">
          <div>
            <div className="font-medium">
              Modo atual: <span className={form.realModeEnabled ? "text-bull" : "text-warn"}>
                {form.realModeEnabled ? "REAL" : "PAPER TRADING"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {form.realModeEnabled
                ? "Executa ordens reais na Binance. Capital sob risco."
                : "Simula ordens sem capital real. Ideal para validar estratégia."}
            </div>
          </div>
          {form.realModeEnabled ? (
            <Button variant="outline" onClick={() => set("realModeEnabled", false)}>
              Voltar para Paper
            </Button>
          ) : (
            <ConfirmDialog
              trigger={<Button className="bg-bull text-background hover:bg-bull/90">Ativar modo REAL</Button>}
              title="Ativar modo REAL?"
              description={
                <div className="space-y-2 text-sm">
                  <p>O bot passará a executar <strong>ordens reais</strong> na sua conta Binance,
                  usando capital real, com todas as estratégias configuradas.</p>
                  <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                    <li>Risco máximo por trade: 1% do equity</li>
                    <li>Stop diário: {form.maxDailyLossPct}% do equity</li>
                    <li>Circuit breakers ativos (BTC crash, funding, drawdown)</li>
                  </ul>
                </div>
              }
              confirmLabel="Ativar REAL"
              onConfirm={() => set("realModeEnabled", true)}
            />
          )}
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => save.mutate(form)} disabled={save.isPending}
          className="shadow-xl">
          {save.isPending ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, hint, children }: {
  icon: typeof Key; title: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center w-9 h-9 rounded-md bg-accent/60 border border-border">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{title}</h2>
          {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-surface/50 border border-border">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
