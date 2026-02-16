import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log("🔥 Firebase Admin Initialized");
    } catch (error: any) {
        console.error("Firebase Admin Init Error:", error.message);
    }
}

export const dbAdmin = admin.apps.length > 0 ? admin.firestore() : {} as any;
export const authAdmin = admin.apps.length > 0 ? admin.auth() : {} as any;
