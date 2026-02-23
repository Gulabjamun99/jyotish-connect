const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyAaJ6hbSJO8IpnNbNTE2aHfgLp0P91objE",
    authDomain: "astropanditconsult.firebaseapp.com",
    projectId: "astropanditconsult",
    storageBucket: "astropanditconsult.firebasestorage.app",
    messagingSenderId: "310347510650",
    appId: "1:310347510650:web:a12d630d90d52bdf325cc3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteDemos() {
    try {
        console.log("Fetching astrologers...");
        const snapshot = await getDocs(collection(db, "astrologers"));
        let count = 0;

        for (const child of snapshot.docs) {
            if (child.id !== "1i5Fj2u7VrexYbvPfVDIX7NX9Dd2") { // Keep c kumar
                await deleteDoc(doc(db, "astrologers", child.id));
                console.log(`Deleted demo: ${child.data().displayName || child.id}`);
                count++;
            } else {
                console.log(`Kept real astrologer: ${child.data().displayName} (${child.id})`);
            }
        }

        console.log(`Finished deleting ${count} demo astrologers.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

deleteDemos();
