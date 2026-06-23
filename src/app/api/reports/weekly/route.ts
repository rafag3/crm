// ============================================================
// /api/reports/weekly
//
//   GET — fetch aggregated weekly data for the report.
//         Admin+. Can also be called by a cron webhook.
// ============================================================

import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const supabase = ctx.supabase;
    const accountId = ctx.accountId;

    const now = new Date();
    const weekStart = startOfWeek(now).toISOString();
    const weekEnd = endOfWeek(now).toISOString();

    const prevWeekStart = startOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).toISOString();
    const prevWeekEnd = weekStart;

    // Run all queries in parallel
    const [
      conversationsThisWeek,
      conversationsPrevWeek,
      messagesOutbound,
      messagesPrevOutbound,
      newContacts,
      newContactsPrev,
      openDeals,
    ] = await Promise.allSettled([
      // Conversations opened this week
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId)
        .gte("created_at", weekStart)
        .lt("created_at", weekEnd),

      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId)
        .gte("created_at", prevWeekStart)
        .lt("created_at", prevWeekEnd),

      // Outbound messages this week
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId)
        .eq("direction", "outbound")
        .gte("created_at", weekStart)
        .lt("created_at", weekEnd),

      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId)
        .eq("direction", "outbound")
        .gte("created_at", prevWeekStart)
        .lt("created_at", prevWeekEnd),

      // New contacts this week
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId)
        .gte("created_at", weekStart)
        .lt("created_at", weekEnd),

      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("account_id", accountId)
        .gte("created_at", prevWeekStart)
        .lt("created_at", prevWeekEnd),

      // Open deals
      supabase
        .from("deals")
        .select("id, value", { count: "exact" })
        .eq("account_id", accountId)
        .not("stage_id", "is", null),
    ]);

    const getCount = (r: PromiseSettledResult<{ count: number | null }>) =>
      r.status === "fulfilled" ? (r.value.count ?? 0) : 0;

    const conv = getCount(conversationsThisWeek as PromiseSettledResult<{ count: number | null }>);
    const convPrev = getCount(conversationsPrevWeek as PromiseSettledResult<{ count: number | null }>);
    const msgs = getCount(messagesOutbound as PromiseSettledResult<{ count: number | null }>);
    const msgsPrev = getCount(messagesPrevOutbound as PromiseSettledResult<{ count: number | null }>);
    const contacts = getCount(newContacts as PromiseSettledResult<{ count: number | null }>);
    const contactsPrev = getCount(newContactsPrev as PromiseSettledResult<{ count: number | null }>);

    const deals =
      openDeals.status === "fulfilled" && Array.isArray(openDeals.value.data)
        ? openDeals.value.data
        : [];
    const dealsCount = deals.length;
    const dealsValue = deals.reduce((sum: number, d: { value?: number }) => sum + (d.value ?? 0), 0);

    const delta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return NextResponse.json({
      period: { start: weekStart, end: weekEnd },
      metrics: {
        conversations: { value: conv, delta: delta(conv, convPrev) },
        messagesSent: { value: msgs, delta: delta(msgs, msgsPrev) },
        newContacts: { value: contacts, delta: delta(contacts, contactsPrev) },
        openDeals: { count: dealsCount, totalValue: dealsValue },
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
