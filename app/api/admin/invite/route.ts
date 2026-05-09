import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createNotification } from "@/lib/notifications";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  let createdUid: string | null = null;

  try {
    // 1. Verify the caller is an authenticated admin
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded    = await adminAuth.verifySessionCookie(sessionCookie, true);
    const callerSnap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!callerSnap.exists || callerSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { accountId, name: adminName } = callerSnap.data()!;

    // 2. Parse body
    const { name, email, password, role = "creator" } = await req.json();
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // 3. Create Firebase Auth user
    const newUser = await adminAuth.createUser({
      email:       email.trim(),
      displayName: name.trim(),
      password,
    });
    createdUid = newUser.uid;

    // 4. Write Firestore user doc under the same account
    await adminDb.collection("users").doc(newUser.uid).set({
      accountId,
      name:      name.trim(),
      email:     email.trim(),
      role,
      is_active: true,
      timezone:  "UTC",
      createdAt: new Date().toISOString(),
      createdBy: decoded.uid,
    });

    // 5. Send invite email via Resend
    const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const loginUrl  = `${appUrl}/join`;
    let   emailSent = false;

    try {
      await resend.emails.send({
        from:    "Crextio <onboarding@resend.dev>",
        to:      email.trim(),
        subject: `${adminName} added you to Crextio`,
        html:    buildInviteEmail({ adminName, email: email.trim(), password, role, loginUrl }),
      });
      emailSent = true;
    } catch (mailErr) {
      console.error("[/api/admin/invite] email failed:", mailErr);
    }

    // Welcome notification for the new user
    await createNotification({
      toUid:     newUser.uid,
      accountId,
      type:      "welcome",
      title:     `Welcome to ${adminName}'s workspace`,
      body:      `You've been added as ${role === "creator" ? "a Creator" : role === "manager" ? "a Manager" : "an Admin"}. Get started by checking your dashboard.`,
      link:      "/dashboard",
    });

    // "Member joined" notification for the admin who invited
    await createNotification({
      toUid:     decoded.uid,
      accountId,
      type:      "member_joined",
      title:     `${name.trim()} joined your workspace`,
      body:      `${email.trim()} was added as ${role}.`,
      link:      "/admin",
    });

    return NextResponse.json({ uid: newUser.uid, email: email.trim(), emailSent });

  } catch (err: any) {
    if (createdUid) {
      try { await adminAuth.deleteUser(createdUid); } catch {}
    }
    if (err.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    console.error("[/api/admin/invite]", err);
    return NextResponse.json({ error: "Failed to create user. Please try again." }, { status: 500 });
  }
}

function buildInviteEmail({ adminName, email, password, role, loginUrl }: {
  adminName: string; email: string; password: string; role: string; loginUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:24px;border:1px solid #E9E9E2;overflow:hidden;">

        <tr>
          <td style="background:#1A1A1A;padding:32px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
              <td style="background:#FFD567;border-radius:12px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="font-size:18px;font-weight:900;color:#1A1A1A;">C</span>
              </td>
              <td style="padding-left:12px;color:#fff;font-size:20px;font-weight:700;vertical-align:middle;">Crextio</td>
            </tr></table>
          </td>
        </tr>

        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 8px;font-size:13px;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">You&rsquo;ve been added</p>
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1A1A1A;line-height:1.3;">
            ${adminName} added you to their Crextio workspace
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
            Your account is ready. Use the credentials below to log in now.
          </p>

          <!-- Credentials -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#1A1A1A;border-radius:16px;padding:24px 28px;margin-bottom:28px;">
            <tr><td style="padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;">Email</span><br/>
              <span style="font-size:15px;font-weight:700;color:#fff;">${email}</span>
            </td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;">Password</span><br/>
              <span style="font-size:22px;font-weight:900;color:#FFD567;letter-spacing:.05em;">${password}</span>
            </td></tr>
            <tr><td style="padding-top:14px;">
              <span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;">Role</span><br/>
              <span style="font-size:15px;font-weight:700;color:#fff;text-transform:capitalize;">${role}</span>
            </td></tr>
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:#FFD567;border-radius:14px;padding:16px 32px;">
              <a href="${loginUrl}" style="color:#1A1A1A;font-size:15px;font-weight:800;text-decoration:none;white-space:nowrap;">
                Log in to Crextio &rarr;
              </a>
            </td></tr>
          </table>

          <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.8;">
            You can change your password anytime from Settings after logging in.
          </p>
        </td></tr>

        <tr><td style="padding:20px 40px;border-top:1px solid #E9E9E2;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;">Crextio &middot; TikTok Creator Management</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
