import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createNotification } from "@/lib/notifications";

// PATCH /api/admin/members
// body: { uid, role? } | { uid, is_active? }
export async function PATCH(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller || caller.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { uid } = body;
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    if (uid === caller.uid) {
      return NextResponse.json({ error: "Cannot modify your own account." }, { status: 400 });
    }

    const targetSnap = await adminDb.collection("users").doc(uid).get();
    if (!targetSnap.exists || targetSnap.data()?.accountId !== caller.accountId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (body.role !== undefined) {
      const validRoles = ["admin", "manager", "creator"];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updates.role = body.role;
    }

    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active);
      await adminAuth.updateUser(uid, { disabled: !updates.is_active });
    }

    await adminDb.collection("users").doc(uid).update(updates);

    // Notify affected user when their role changes
    if (body.role !== undefined) {
      const roleLabels: Record<string, string> = {
        admin: "Admin", manager: "Manager", creator: "Creator",
      };
      await createNotification({
        toUid:     uid,
        accountId: caller.accountId,
        type:      "role_changed",
        title:     "Your role was updated",
        body:      `${caller.name} changed your role to ${roleLabels[body.role] ?? body.role}.`,
        link:      "/dashboard",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin_members_patch]", err);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

// DELETE /api/admin/members
// body: { uid } — disables auth + removes from workspace (soft)
export async function DELETE(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller || caller.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { uid } = body;
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    if (uid === caller.uid) {
      return NextResponse.json({ error: "Cannot remove yourself." }, { status: 400 });
    }

    const targetSnap = await adminDb.collection("users").doc(uid).get();
    if (!targetSnap.exists || targetSnap.data()?.accountId !== caller.accountId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Promise.all([
      adminAuth.updateUser(uid, { disabled: true }),
      adminDb.collection("users").doc(uid).update({
        is_active: false,
        accountId: null,
        removedAt: new Date().toISOString(),
        removedBy: caller.uid,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin_members_delete]", err);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
