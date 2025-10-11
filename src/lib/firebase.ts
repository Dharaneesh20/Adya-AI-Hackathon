import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Validate that all required environment variables are present
const validateFirebaseConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingVars);
    throw new Error(
      `Missing required Firebase configuration. Please set the following environment variables in your .env.local file: ${missingVars.join(', ')}`
    );
  }

  // Check for placeholder values
  const placeholderVars = requiredVars.filter(varName => {
    const value = import.meta.env[varName];
    return value && (
      value.includes('your-') || 
      value.includes('replace-') || 
      value === 'demo' ||
      value === 'test'
    );
  });

  if (placeholderVars.length > 0) {
    console.warn('⚠️ Found placeholder Firebase environment variables:', placeholderVars);
    console.warn('Please replace these with your actual Firebase project values.');
  }
};

// Validate configuration
validateFirebaseConfig();

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('🔥 Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING'
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase app:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure emulators for development
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' && import.meta.env.DEV) {
  console.log('🔧 Connecting to Firebase emulators...');
  
  try {
    // Auth emulator
    if (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
      connectAuthEmulator(auth, `http://${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST}`, {
        disableWarnings: true
      });
      console.log('✅ Connected to Auth emulator');
    }

    // Firestore emulator
    if (import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST) {
      const [host, port] = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST.split(':');
      connectFirestoreEmulator(db, host, parseInt(port));
      console.log('✅ Connected to Firestore emulator');
    }

    // Storage emulator
    if (import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST) {
      const [host, port] = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST.split(':');
      connectStorageEmulator(storage, host, parseInt(port));
      console.log('✅ Connected to Storage emulator');
    }
  } catch (error) {
    console.warn('⚠️ Failed to connect to some emulators:', error);
  }
}

export { app };