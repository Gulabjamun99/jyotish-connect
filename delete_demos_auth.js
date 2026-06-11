const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");

const fs = require('fs');
const path = require('path');

let firebaseConfig = {};
try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const getEnv = (key) => {
            const match = envContent.match(new RegExp(`${key}\\s*=\\s*["']?([^"'\r\n]+)["']?`));
            return match ? match[1] : undefined;
        };
        firebaseConfig = {
            apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
            authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
            projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
            storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
            messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
            appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID')
        };
    }
} catch (e) {
    console.error("Failed to load environment variables:", e);
}

firebaseConfig = {
    apiKey: firebaseConfig.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: firebaseConfig.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: firebaseConfig.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: firebaseConfig.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: firebaseConfig.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseConfig.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function deleteDemos() {
    try {
        console.log("Authenticating anonymously...");
        await signInAnonymously(auth);

        console.log("Fetching astrologers...");
        const snapshot = await getDocs(collection(db, "astrologers"));
        let count = 0;

        for (const child of snapshot.docs) {
            if (child.id !== "1i5Fj2u7VrexYbvPfVDIX7NX9Dd2") { // Keep c kumar
                try {
                    await deleteDoc(doc(db, "astrologers", child.id));
                    console.log(`Deleted demo: ${child.data().displayName || child.id}`);
                    count++;
                } catch (e) {
                    console.log(`Failed to delete (Rule denied?): ${child.id}`);
                }
            } else {
                console.log(`Kept real astrologer: ${child.data().displayName} (${child.id})`);
            }
        }

        console.log(`Finished attempting to delete ${count} demo astrologers.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deleteDemos();
