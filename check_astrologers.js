
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkAstrologers() {
    console.log("Fetching astrologers...");
    const astroRef = db.collection('astrologers');
    const snapshot = await astroRef.where('verified', '==', true).get();

    if (snapshot.empty) {
        console.log('No verified astrologers found.');

        // Check unverified
        const allSnapshot = await astroRef.get();
        console.log(`Total astrologers in DB: ${allSnapshot.size}`);
        if (!allSnapshot.empty) {
            console.log("First unverified astrologer:", JSON.stringify(allSnapshot.docs[0].data(), null, 2));
        }
    } else {
        console.log(`Found ${snapshot.size} verified astrologers.`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- ${data.displayName} | Languages: ${data.languages} | Expertise: ${data.specializations}`);
        });
    }
}

checkAstrologers();
