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
let app: any;
let auth: any;
let db: any;
let storage: any;

try {
    if (!firebaseConfig.apiKey) {
        throw new Error("Missing Firebase API Key");
    }
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Ensure network is enabled
    if (typeof window !== 'undefined') {
        enableNetwork(db).catch(err => console.warn("Network enable failed:", err));
    }
} catch (error) {
    console.warn("⚠️ Firebase Client Init Failed:", error);
    if (typeof window !== 'undefined') {
        const missing = [];
        if (!firebaseConfig.apiKey) missing.push("apiKey");
        if (!firebaseConfig.authDomain) missing.push("authDomain");
        if (!firebaseConfig.projectId) missing.push("projectId");
        console.warn("Missing Env Vars:", missing.join(", "));
    }
    // Provide mocks to prevent build crashes on import
    app = {};
    auth = {};
    // Mock db to satisfy simple checks, but it will fail if used
    db = { type: 'dummy', app: {} };
    storage = {};
}

export { app, auth, db, storage };
