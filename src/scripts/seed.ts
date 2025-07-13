
import 'dotenv/config'; // Load environment variables at the very top
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { MOCK_STAFF_USER, MOCK_MANAGER_USER } from '../lib/mock-user';
import { SEED_SHIFTS } from '../lib/seed-data';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const seedDatabase = async () => {
  let app;
  // Initialize Firebase app if not already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  const db = getFirestore(app);

  try {
    console.log('Starting database seeding...');

    // Seed Users
    const usersRef = collection(db, 'users');
    console.log('Seeding users...');
    await setDoc(doc(usersRef, MOCK_STAFF_USER.id), MOCK_STAFF_USER);
    await setDoc(doc(usersRef, MOCK_MANAGER_USER.id), MOCK_MANAGER_USER);
    console.log('Users seeded successfully.');

    // Seed Shifts
    const shiftsRef = collection(db, 'shifts');
    console.log('Seeding shifts...');
    for (const shift of SEED_SHIFTS) {
      await setDoc(doc(shiftsRef, shift.id), shift);
    }
    console.log('Shifts seeded successfully.');

    console.log('Database seeding complete!');
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1); // Exit with error code if seeding fails
  }
};

seedDatabase();
