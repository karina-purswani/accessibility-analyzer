import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// 1. Import 'getFirestore' (It supports named databases now!)
import { getFirestore } from "firebase/firestore"; 

console.log("📢 FIREBASE.JS LOADED 📢");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// 🛑 2. CORRECT SYNTAX FOR NAMED DATABASE
// Pass the database name as the SECOND argument strings.
console.log("📢 CONNECTING TO: accessibility-db");

export const db = getFirestore(app, "accessibility-db"); 

// 🛑 3. VERIFY
console.log("📢 DATABASE OBJECT CREATED:", db._databaseId);