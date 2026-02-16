import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
            console.log("🔥 Firebase Admin Initialized");
        } catch (error: any) {
            console.error("Firebase Admin Init Error:", error.message);
        }
    } else {
        console.warn("⚠️ Firebase Admin skipped: Missing env vars (Project ID, Email, or Key)");
    }
}

export const dbAdmin = admin.apps.length > 0 ? admin.firestore() : {} as any;
export const authAdmin = admin.apps.length > 0 ? admin.auth() : {} as any;
