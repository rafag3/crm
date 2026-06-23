// ============================================================
// /api/business-profile
//
//   GET  — read the account's business profile. Any member.
//   PUT  — upsert (create or overwrite) the profile. Admin+.
// ============================================================

import { NextResponse } from "next/server";
import { getCurrentAccount, requireRole, toErrorResponse } from "@/lib/auth/account";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();

    const { data, error } = await ctx.supabase
      .from("business_profile")
      .select("*")
      .eq("account_id", ctx.accountId)
      .maybeSingle();

    if (error) {
      console.error("[GET /api/business-profile]", error);
      return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
    }

    return NextResponse.json({ profile: data ?? null });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireRole("admin");

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const allowed = [
      "segment",
      "business_name",
      "phone",
      "address",
      "hours",
      "website",
      "description",
      "faqs",
    ] as const;

    // Whitelist fields to avoid accepting arbitrary columns
    const patch: Record<string, unknown> = { account_id: ctx.accountId };
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    // Validate faqs is an array if provided
    if ("faqs" in patch && !Array.isArray(patch.faqs)) {
      return NextResponse.json({ error: "'faqs' must be an array" }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("business_profile")
      .upsert(patch, { onConflict: "account_id" })
      .select()
      .single();

    if (error) {
      console.error("[PUT /api/business-profile]", error);
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
