import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore/lite";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};
// Initialize Firebase
const app = initializeApp({
  projectId: process.env.PROJECT_ID,
  firebaseConfig,
  databaseURL:
    "https://project-asia-58fa0-default-rtdb.asia-southeast1.firebasedatabase.app",
});
const storage = getStorage(app);
const db = getFirestore(app);
const database = getDatabase();

export { storage, db, database };
