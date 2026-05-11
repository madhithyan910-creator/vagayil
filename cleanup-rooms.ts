import { initializeApp } from "firebase/app";
import { collection, deleteDoc, doc, getDocs, getFirestore } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const canonicalTitles = new Set(["A1", "A2", "B1", "B2"]);

async function cleanupRooms() {
  const snapshot = await getDocs(collection(db, "rooms"));
  const rooms = snapshot.docs.map((roomDoc) => ({ id: roomDoc.id, ...roomDoc.data() }));

  for (const room of rooms) {
    if (!canonicalTitles.has((room as any).title)) {
      await deleteDoc(doc(db, "rooms", (room as any).id));
      console.log(`Deleted room: ${(room as any).title}`);
    }
  }

  console.log("Room cleanup complete.");
}

cleanupRooms().catch((error) => {
  console.error(error);
  process.exit(1);
});
