import { NextRequest, NextResponse } from "next/server";
import { getCallerProfile } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const caller = await getCallerProfile(req);
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceName, platform, teamSize } = await req.json();

  if (!workspaceName?.trim()) {
    return NextResponse.json({ error: "Workspace name required" }, { status: 400 });
  }

  const batch = adminDb.batch();

  batch.update(adminDb.collection("accounts").doc(caller.accountId), {
    name: workspaceName.trim(),
  });

  batch.update(adminDb.collection("users").doc(caller.uid), {
    onboardingComplete: true,
    platform:  platform  || null,
    teamSize:  teamSize  || null,
  });

  await batch.commit();

  return NextResponse.json({ ok: true });
}
