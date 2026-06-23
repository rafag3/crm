// ============================================================
// /api/reports/weekly/send
//
//   POST — generate HTML email and send via configured provider.
//          This stub logs the payload and returns 200 so the UI
//          works end-to-end. Wire up your email provider here
//          (Resend, SendGrid, Nodemailer, etc.)
// ============================================================

import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";

export async function POST(request: Request) {
  try {
    await requireRole("admin");

    const body = (await request.json().catch(() => null)) as {
      to?: string;
      report?: object;
    } | null;

    if (!body?.to || typeof body.to !== "string") {
      return NextResponse.json({ error: "'to' email is required" }, { status: 400 });
    }

    const { to, report } = body;

    // ── EMAIL SEND HOOK ──────────────────────────────────────────────────────
    // Replace the log below with your email provider of choice.
    //
    // Example with Resend (npm install resend):
    //   import { Resend } from "resend";
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: "relatorio@suaempresa.com.br",
    //     to,
    //     subject: `Relatório semanal — ${new Date().toLocaleDateString("pt-BR")}`,
    //     html: buildEmailHtml(report),
    //   });
    //
    // Example with SendGrid:
    //   import sgMail from "@sendgrid/mail";
    //   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    //   await sgMail.send({ to, from: "...", subject: "...", html: buildEmailHtml(report) });
    // ────────────────────────────────────────────────────────────────────────

    console.log("[/api/reports/weekly/send] would send to:", to, JSON.stringify(report, null, 2));

    // TODO: plug in your email provider above, then remove this log.
    return NextResponse.json({ ok: true, to, note: "Email provider not configured — see route comment." });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * Builds a simple HTML email from the weekly report data.
 * Ready to use once you wire up a provider.
 */
export function buildEmailHtml(report: {
  period: { start: string; end: string };
  metrics: {
    conversations: { value: number; delta: number };
    messagesSent: { value: number; delta: number };
    newContacts: { value: number; delta: number };
    openDeals: { count: number; totalValue: number };
  };
}): string {
  const fmt = (n: number) => n.toLocaleString("pt-BR");
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  const delta = (d: number) =>
    d === 0 ? "Sem variação" : `${d > 0 ? "+" : ""}${d}% vs semana anterior`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Inter,sans-serif;color:#e5e5e5">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 16px">
    <tr><td>
      <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 4px">Relatório Semanal</h1>
      <p style="font-size:13px;color:#888;margin:0 0 28px">
        ${fmtDate(report.period.start)} – ${fmtDate(report.period.end)}
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${metric("Conversas abertas", fmt(report.metrics.conversations.value), delta(report.metrics.conversations.delta))}
          ${metric("Mensagens enviadas", fmt(report.metrics.messagesSent.value), delta(report.metrics.messagesSent.delta))}
        </tr>
        <tr>
          ${metric("Novos contatos", fmt(report.metrics.newContacts.value), delta(report.metrics.newContacts.delta))}
          ${metric("Negócios em aberto", fmt(report.metrics.openDeals.count), fmtCurrency(report.metrics.openDeals.totalValue) + " em pipeline")}
        </tr>
      </table>

      <p style="font-size:11px;color:#555;margin:32px 0 0;text-align:center">
        Enviado automaticamente pelo seu CRM WhatsApp.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function metric(label: string, value: string, sub: string) {
  return `<td width="50%" style="padding:8px">
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:16px">
      <p style="font-size:11px;color:#888;margin:0 0 6px">${label}</p>
      <p style="font-size:28px;font-weight:700;color:#fff;margin:0 0 4px">${value}</p>
      <p style="font-size:11px;color:#aaa;margin:0">${sub}</p>
    </div>
  </td>`;
}
