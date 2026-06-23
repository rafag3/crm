// ============================================================
// /api/widget-config
//
//   GET — read widget config (public — no auth required so the
//         embed script can call it from the client site).
//   PUT — upsert config. Admin+.
// ============================================================

import { NextResponse } from "next/server";
import { getCurrentAccount, requireRole, toErrorResponse } from "@/lib/auth/account";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();

    const { data, error } = await ctx.supabase
      .from("widget_config")
      .select("enabled, phone_number, button_text, welcome_message, position")
      .eq("account_id", ctx.accountId)
      .maybeSingle();

    if (error) {
      console.error("[GET /api/widget-config]", error);
      return NextResponse.json({ error: "Failed to load config" }, { status: 500 });
    }

    return NextResponse.json({ config: data ?? null });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireRole("admin");

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const allowed = ["enabled", "phone_number", "button_text", "welcome_message", "position"] as const;
    const patch: Record<string, unknown> = { account_id: ctx.accountId };
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    if (patch.position && !["left", "right"].includes(patch.position as string)) {
      return NextResponse.json({ error: "'position' must be 'left' or 'right'" }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("widget_config")
      .upsert(patch, { onConflict: "account_id" })
      .select()
      .single();

    if (error) {
      console.error("[PUT /api/widget-config]", error);
      return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }

    return NextResponse.json({ config: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
