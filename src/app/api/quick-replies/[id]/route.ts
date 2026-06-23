// ============================================================
// /api/quick-replies/[id]
//
//   PUT    — update a quick reply. Admin+.
//   DELETE — delete a quick reply. Admin+.
// ============================================================

import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth/account";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireRole("admin");
    const { id } = await params;

    const body = (await request.json().catch(() => null)) as {
      shortcut?: unknown;
      title?: unknown;
      content?: unknown;
    } | null;

    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const patch: Record<string, string> = {};
    if (typeof body.shortcut === "string") patch.shortcut = body.shortcut.trim().toLowerCase().replace(/\s+/g, "-");
    if (typeof body.title === "string") patch.title = body.title.trim();
    if (typeof body.content === "string") patch.content = body.content.trim();

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("quick_replies")
      .update(patch)
      .eq("id", id)
      .eq("account_id", ctx.accountId)
      .select()
      .single();

    if (error) {
      console.error("[PUT /api/quick-replies/[id]]", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ quickReply: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireRole("admin");
    const { id } = await params;

    const { error } = await ctx.supabase
      .from("quick_replies")
      .delete()
      .eq("id", id)
      .eq("account_id", ctx.accountId);

    if (error) {
      console.error("[DELETE /api/quick-replies/[id]]", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
