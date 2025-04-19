// Helper file to get the appropriate Firebase instance based on context

// This function should only be called in server components or API routes
export function getServerFirebase() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerFirebase should only be called from server-side code');
  }
  
  // Dynamic import to avoid loading admin SDK on client
  // This is only executed on the server
  const { adminDb, adminAuth, adminStorage } = require('./firebaseAdmin');
  
  return {
    db: adminDb,
    auth: adminAuth,
    storage: adminStorage,
  };
}

// This should be used in client components
export function getClientFirebase() {
  if (typeof window === 'undefined') {
    throw new Error('getClientFirebase should only be called from client-side code');
  }
  
  const { clientDb, clientAuth, clientStorage } = require('./firebaseConfig');
  
  return {
    db: clientDb,
    auth: clientAuth,
    storage: clientStorage,
  };
} 