import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Add a check for the API key to provide a more helpful error message.
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_api_key") {
  console.error("*****************************************************************");
  console.error("Firebase API Key is missing or using the placeholder value.");
  console.error("Please follow these steps:");
  console.error("1. Open the '.env' file in the root of your project.");
  console.error("2. Replace the placeholder values with your actual Firebase project credentials.");
  console.error("3. Restart your development server.");
  console.error("*****************************************************************");
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };
