const fs = require('fs');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc } = require("firebase/firestore");

// 1. Manually parse .env.local
let envContent = "";
try {
    envContent = fs.readFileSync('.env.local', 'utf-8');
} catch (e) {
    console.error("Could not read .env.local file:", e.message);
    process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
    const split = line.split('=');
    if (split.length >= 2) {
        const key = split[0].trim();
        const val = split.slice(1).join('=').trim().replace(/^"|"$/g, '');
        envVars[key] = val;
    }
});

const firebaseConfig = {
    apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Initializing Firebase with project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const adminEmails = [
    "enjoylifeauw@gmail.com",
    "en.joy.life.auw@gmail.com",
    "admin@jyotishconnect.com"
];

async function run() {
    try {
        const usersRef = collection(db, "users");
        console.log("Searching for users with emails:", adminEmails);
        
        for (const email of adminEmails) {
            const q = query(usersRef, where("email", "==", email));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                console.log(`No existing user document found for: ${email}. Creating a temporary one...`);
                // Create a temporary document with a placeholder ID if needed, 
                // but usually they already signed up so they should have a document.
                // We will create a document using a deterministic ID or wait for them to log in.
                // If they logged in, they already have a UID. Let's see if we can find them.
            } else {
                for (const userDoc of snapshot.docs) {
                    const uid = userDoc.id;
                    console.log(`Found user ${email} with UID: ${uid}. Setting role to admin...`);
                    await updateDoc(doc(db, "users", uid), {
                        role: "admin"
                    });
                    console.log(`Successfully updated ${email} to admin!`);
                }
            }
        }
        
        // Also check if we can list all documents in 'users' collection to see who is registered
        console.log("\nListing all registered users in 'users' collection:");
        const allUsers = await getDocs(usersRef);
        allUsers.forEach(doc => {
            const data = doc.data();
            console.log(`- UID: ${doc.id} | Email: ${data.email} | Role: ${data.role} | Name: ${data.displayName}`);
        });

        console.log("\nDone!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating admin role:", error);
        process.exit(1);
    }
}

run();
