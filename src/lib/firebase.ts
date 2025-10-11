import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

function validateFirebaseConfig() {
  const requiredFields = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingFields = requiredFields.filter(field => !import.meta.env[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration:', missingFields);
    throw new Error(`Missing Firebase environment variables: ${missingFields.join(', ')}`);
  }

  // Validate specific field formats
  if (!firebaseConfig.projectId || firebaseConfig.projectId === 'undefined') {
    throw new Error('Firebase Project ID is invalid or missing');
  }

  if (!firebaseConfig.authDomain || !firebaseConfig.authDomain.includes('.firebaseapp.com')) {
    throw new Error('Firebase Auth Domain is invalid. Should be in format: your-project.firebaseapp.com');
  }

  console.log('✅ Firebase configuration validated successfully');
  console.log('🔧 Project ID:', firebaseConfig.projectId);
  console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
}

// Validate configuration before initializing
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Could not connect to Firebase emulators:', error);
  }
}

export { app };