import { adminDb } from "@/lib/firebase-admin";

export type NotificationType =
  | "welcome"
  | "member_joined"
  | "new_collab"
  | "stage_change"
  | "new_sample"
  | "new_order"
  | "needs_reply"
  | "role_changed"
  | "system";

interface NotificationPayload {
  toUid: string;
  accountId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(payload: NotificationPayload) {
  await adminDb.collection("notifications").add({
    toUid:     payload.toUid,
    accountId: payload.accountId,
    type:      payload.type,
    title:     payload.title,
    body:      payload.body,
    link:      payload.link ?? null,
    metadata:  payload.metadata ?? null,
    read:      false,
    createdAt: new Date().toISOString(),
  });
}

// Notify every admin + manager in a workspace, skipping the actor
export async function notifyWorkspace(
  accountId: string,
  excludeUid: string,
  payload: Omit<NotificationPayload, "toUid" | "accountId">
) {
  const snap = await adminDb
    .collection("users")
    .where("accountId", "==", accountId)
    .where("role", "in", ["admin", "manager"])
    .get();

  if (snap.empty) return;

  const batch = adminDb.batch();
  snap.docs.forEach(d => {
    if (d.id === excludeUid) return;
    const ref = adminDb.collection("notifications").doc();
    batch.set(ref, {
      toUid:     d.id,
      accountId,
      type:      payload.type,
      title:     payload.title,
      body:      payload.body,
      link:      payload.link ?? null,
      metadata:  payload.metadata ?? null,
      read:      false,
      createdAt: new Date().toISOString(),
    });
  });
  await batch.commit();
}
