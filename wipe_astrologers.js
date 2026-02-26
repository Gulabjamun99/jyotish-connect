import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function wipeAstrologers() {
  console.log("Fetching all astrologers from Firestore...");
  const querySnapshot = await getDocs(collection(db, "astrologers"));
  
  if (querySnapshot.empty) {
      console.log("No astrologers found in the database.");
      return;
  }

  let count = 0;
  for (const item of querySnapshot.docs) {
    try {
        await deleteDoc(doc(db, "astrologers", item.id));
        console.log(`Deleted: ${item.id}`);
        count++;
    } catch(e) {
        console.error(`Failed to delete ${item.id}:`, e);
    }
  }
  
  console.log(`Successfully deleted ${count} astrologers.`);
  process.exit(0);
}

wipeAstrologers();
