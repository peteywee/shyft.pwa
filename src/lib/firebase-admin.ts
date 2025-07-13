
import * as admin from 'firebase-admin';

// Parse the private key from a JSON string to avoid regex issues
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY).private_key 
  : undefined;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
