import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase configuration:', missing);
    console.warn('Please set up your Firebase configuration in .env.local');
  }

  return missing.length === 0;
};

// Check for placeholder values
const placeholderVars = [
  'your-api-key-here',
  'your-project-id-here',
  'your-auth-domain-here'
];

const hasPlaceholders = placeholderVars.some(placeholder => 
  Object.values(import.meta.env).includes(placeholder)
);

if (hasPlaceholders) {
  console.warn('Firebase configuration contains placeholder values. Please update your .env.local file with actual Firebase config.');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
const isConfigValid = validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Development emulators
if (import.meta.env.DEV && isConfigValid) {
  try {
    // Only connect to emulators if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    
    // Check if Firestore is not already connected to emulator
    if (!(db as any)._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
    
    // Check if Storage is not already connected to emulator
    if (!storage._location.bucket.includes('demo-')) {
      connectStorageEmulator(storage, '127.0.0.1', 9199);
    }
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

// Export app for potential additional configuration
export default app;