const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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
