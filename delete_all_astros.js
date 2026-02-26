const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, deleteDoc, doc } = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");

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
const auth = getAuth(app);

async function wipeAll() {
    try {
        console.log("Authenticating anonymously...");
        await signInAnonymously(auth);

        console.log("Fetching all astrologers...");
        const snapshot = await getDocs(collection(db, "astrologers"));
        let count = 0;

        for (const child of snapshot.docs) {
            try {
                await deleteDoc(doc(db, "astrologers", child.id));
                console.log(`Deleted: ${child.data().displayName || child.id}`);
                count++;
            } catch (e) {
                console.log(`Failed to delete (Rule denied?): ${child.id}`);
            }
        }

        console.log(`Finished deleting ${count} astrologers.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

wipeAll();
