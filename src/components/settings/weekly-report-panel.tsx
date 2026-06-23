"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, BarChart3, Send, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SettingsPanelHead } from "./settings-panel-head";

interface WeeklyMetric {
  value: number;
  delta: number; // percentage vs previous week
}

interface WeeklyReport {
  period: { start: string; end: string };
  metrics: {
    conversations: WeeklyMetric;
    messagesSent: WeeklyMetric;
    newContacts: WeeklyMetric;
    openDeals: { count: number; totalValue: number };
  };
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Minus className="size-3" /> Sem variação</span>;
  const up = delta > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", up ? "text-emerald-400" : "text-red-400")}>
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {up ? "+" : ""}{delta}% vs semana anterior
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function WeeklyReportPanel() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sent, setSent] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/weekly", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar");
      const data: WeeklyReport = await res.json();
      setReport(data);
    } catch {
      toast.error("Não foi possível carregar o relatório.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailTo.trim()) {
      toast.error("Informe um e-mail de destino.");
      return;
    }
    if (!report) return;

    setSending(true);
    try {
      // Build a simple HTML email body and send via API
      const res = await fetch("/api/reports/weekly/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, report }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Erro ao enviar");
      }
      setSent(true);
      toast.success(`Relatório enviado para ${emailTo}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="max-w-2xl animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Relatório Semanal"
        description="Resumo das métricas da semana atual. Você pode enviar por e-mail manualmente ou configurar envio automático toda segunda-feira."
      />

      {/* Report preview */}
      <Card className="mb-6">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {report
                  ? `${formatDate(report.period.start)} – ${formatDate(report.period.end)}`
                  : "Esta semana"}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadReport}
              disabled={loading}
              className="h-7 text-xs text-muted-foreground"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando métricas…
            </div>
          ) : report ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Conversations */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Conversas abertas</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{report.metrics.conversations.value}</p>
                <DeltaBadge delta={report.metrics.conversations.delta} />
              </div>
              {/* Messages */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Mensagens enviadas</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{report.metrics.messagesSent.value}</p>
                <DeltaBadge delta={report.metrics.messagesSent.delta} />
              </div>
              {/* Contacts */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Novos contatos</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{report.metrics.newContacts.value}</p>
                <DeltaBadge delta={report.metrics.newContacts.delta} />
              </div>
              {/* Deals */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Negócios abertos</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{report.metrics.openDeals.count}</p>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(report.metrics.openDeals.totalValue)} em pipeline
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados disponíveis.</p>
          )}
        </CardContent>
      </Card>

      {/* Send by email */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Enviar por e-mail</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Envie o relatório desta semana agora para qualquer endereço. Para envio automático toda segunda-feira, configure um agendamento.
          </p>
          <form onSubmit={handleSendEmail} className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="report-email" className="sr-only">E-mail de destino</Label>
              <Input
                id="report-email"
                type="email"
                value={emailTo}
                onChange={(e) => { setEmailTo(e.target.value); setSent(false); }}
                placeholder="dono@empresa.com.br"
                disabled={sending}
              />
            </div>
            <Button type="submit" disabled={sending || !report || sent}>
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : sent ? (
                "Enviado ✓"
              ) : (
                <>
                  <Send className="size-4" />
                  Enviar
                </>
              )}
            </Button>
          </form>

          {/* Info about automatic sending */}
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Envio automático:</strong> para receber todo início de semana automaticamente, configure uma tarefa agendada que chame{" "}
            <code className="rounded bg-muted px-1 text-primary">POST /api/reports/weekly/send</code>{" "}
            com o e-mail de destino. Use um serviço como{" "}
            <strong>Supabase Edge Functions + pg_cron</strong> ou{" "}
            <strong>Vercel Cron Jobs</strong>.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
