const fs = require('fs');
const admin = require('firebase-admin');

// 1. Manually parse .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const split = line.split('=');
    if (split.length >= 2) {
        const key = split[0].trim();
        const val = split.slice(1).join('=').trim().replace(/^"|"$/g, '');
        envVars[key] = val;
    }
});

// 2. Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
        privateKey: envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
});

const db = admin.firestore();

// 3. Delete Demos
async function run() {
    try {
        console.log("Fetching all astrologers...");
        const snapshot = await db.collection('astrologers').get();
        let deleted = 0;
        let kept = 0;

        const batch = db.batch();

        snapshot.forEach(doc => {
            if (doc.id !== "1i5Fj2u7VrexYbvPfVDIX7NX9Dd2") {
                batch.delete(doc.ref);
                deleted++;
            } else {
                kept++;
            }
        });

        console.log(`Committing batch delete for ${deleted} demo astrologers...`);
        await batch.commit();
        console.log(`Success! Deleted ${deleted} demo astrologers. Kept ${kept} real astrologers.`);
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

run();
