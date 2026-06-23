// ============================================================
// /api/quick-replies
//
//   GET  — list all quick replies for the account. Any member.
//   POST — create a new quick reply. Admin+.
// ============================================================

import { NextResponse } from "next/server";
import { getCurrentAccount, requireRole, toErrorResponse } from "@/lib/auth/account";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();

    const { data, error } = await ctx.supabase
      .from("quick_replies")
      .select("id, shortcut, title, content, created_at")
      .eq("account_id", ctx.accountId)
      .order("shortcut", { ascending: true });

    if (error) {
      console.error("[GET /api/quick-replies]", error);
      return NextResponse.json({ error: "Failed to load quick replies" }, { status: 500 });
    }

    return NextResponse.json({ quickReplies: data ?? [] });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("admin");

    const body = (await request.json().catch(() => null)) as {
      shortcut?: unknown;
      title?: unknown;
      content?: unknown;
    } | null;

    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const shortcut = typeof body.shortcut === "string" ? body.shortcut.trim().toLowerCase().replace(/\s+/g, "-") : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!shortcut) return NextResponse.json({ error: "'shortcut' is required" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "'title' is required" }, { status: 400 });
    if (!content) return NextResponse.json({ error: "'content' is required" }, { status: 400 });

    const { data, error } = await ctx.supabase
      .from("quick_replies")
      .insert({ account_id: ctx.accountId, shortcut, title, content })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/quick-replies]", error);
      return NextResponse.json({ error: "Failed to create quick reply" }, { status: 500 });
    }

    return NextResponse.json({ quickReply: data }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
