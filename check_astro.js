const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function check() {
    const querySnapshot = await getDocs(collection(db, "astrologers"));
    let astrologers = [];
    querySnapshot.forEach((doc) => {
        astrologers.push({ id: doc.id, ...doc.data() });
    });
    console.log(JSON.stringify(astrologers, null, 2));
    process.exit(0);
}
check();
