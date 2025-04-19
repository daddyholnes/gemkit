// Server-side Firebase Admin SDK
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';

// Server-side initialization
let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;
let adminStorage: Storage;

// Only initialize if we're on the server and there's no app
if (typeof window === 'undefined' && getApps().length === 0) {
  try {
    // Get service account path
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_CREDENTIALS;
    
    // Initialize with service account if available
    if (serviceAccountPath) {
      // In development, we can use a local file
      // In production, this would typically be loaded from a secure environment variable
      const serviceAccount = require(serviceAccountPath);
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        storageBucket: `${process.env.GOOGLE_CLOUD_PROJECT}.appspot.com`,
      });
    } else {
      // Fallback to application default credentials
      adminApp = initializeApp({
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        storageBucket: `${process.env.GOOGLE_CLOUD_PROJECT}.appspot.com`,
      });
    }
    
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    adminStorage = getStorage(adminApp);
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    // Initialize with empty objects for type safety
    adminApp = {} as App;
    adminDb = {} as Firestore;
    adminAuth = {} as Auth;
    adminStorage = {} as Storage;
  }
} else {
  // Initialize with empty objects for type safety in client context
  adminApp = {} as App;
  adminDb = {} as Firestore;
  adminAuth = {} as Auth;
  adminStorage = {} as Storage;
}

export { adminApp, adminDb, adminAuth, adminStorage }; 