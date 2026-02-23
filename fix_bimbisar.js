const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc } = require("firebase/firestore");

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

async function fix() {
    const ref = doc(db, "astrologers", "1i5Fj2u7VrexYbvPfVDIX7NX9Dd2");
    await updateDoc(ref, {
        displayName: "Acharya Bimbisar",
        name: "Acharya Bimbisar"
    });
    console.log("Updated to Acharya Bimbisar!");
    process.exit(0);
}
fix();
