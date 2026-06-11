import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, Firestore, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
    if (typeof window !== 'undefined') {
        if (!firebaseConfig.apiKey) {
            console.warn("⚠️ Firebase API Key missing. Some features will be disabled.");
        } else {
            // Initialize Firebase
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            storage = getStorage(app);

            // Ensure network is enabled
            enableNetwork(db).catch(err => console.warn("Network enable failed:", err));
        }
    } else {
        // Server side initialization (if needed, though mostly used on client)
        if (firebaseConfig.apiKey) {
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            storage = getStorage(app);
        }
    }
} catch (error) {
    console.error("🔥 Firebase Init Critical Failure:", error);
    // Do not throw here, handle nulls in providers
}

export { app, auth, db, storage };
