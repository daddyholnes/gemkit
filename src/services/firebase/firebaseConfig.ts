// Firebase configuration for both client and server usage
// Client-side Firebase imports
import { initializeApp as initializeClientApp, FirebaseApp } from 'firebase/app';
import { getAuth as getClientAuth, Auth } from 'firebase/auth';
import { getFirestore as getClientFirestore, Firestore } from 'firebase/firestore';
import { getStorage as getClientStorage, FirebaseStorage } from 'firebase/storage';

// Environment variables for client-side
const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize client Firebase app
let clientApp: FirebaseApp | undefined;
let clientAuth: Auth | undefined;
let clientDb: Firestore | undefined;
let clientStorage: FirebaseStorage | undefined;

// Only initialize client-side Firebase in the browser
if (typeof window !== 'undefined') {
  // Initialize only once
  if (!clientApp) {
    clientApp = initializeClientApp(clientConfig);
    clientAuth = getClientAuth(clientApp);
    clientDb = getClientFirestore(clientApp);
    clientStorage = getClientStorage(clientApp);
  }
}

export { clientApp, clientAuth, clientDb, clientStorage };

// For server-side code, create a separate file called firebaseAdmin.ts
// that will handle all server-side Firebase operations 