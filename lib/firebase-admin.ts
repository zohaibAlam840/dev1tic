import admin from "firebase-admin";

const serviceAccount = {
  projectId:   process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error("Firebase Admin variables are missing in .env.local");
    // Fallback or more descriptive error
    throw new Error(
      `Service account configuration is incomplete. Missing: ${
        [
          !serviceAccount.projectId && "FIREBASE_PROJECT_ID",
          !serviceAccount.clientEmail && "FIREBASE_CLIENT_EMAIL",
          !serviceAccount.privateKey && "FIREBASE_PRIVATE_KEY",
        ]
          .filter(Boolean)
          .join(", ")
      }`
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}

export const adminAuth = admin.auth();
export const adminDb   = admin.firestore();
