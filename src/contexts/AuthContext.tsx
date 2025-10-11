import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider 
} from 'firebase/auth';
import type { UserRole, AppUser } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  retryLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getErrorMessage = (error: any): string => {
  console.error('Firebase Auth Error Details:', {
    code: error?.code,
    message: error?.message,
    details: error
  });

  switch (error?.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in is in progress. Please wait a moment and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase authentication. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase. Please contact support.';
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Please check the configuration.';
    case 'auth/app-deleted':
      return 'Firebase app has been deleted. Please contact support.';
    case 'auth/network-request-failed':
      return 'Network error occurred. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a few minutes and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/configuration-not-found':
      return 'Firebase configuration is missing. Please contact support.';
    case 'auth/missing-api-key':
      return 'Firebase API key is missing. Please contact support.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    default:
      return error?.message || 'An unexpected error occurred during sign-in. Please try again.';
  }
};

const validateFirebaseConfig = (): boolean => {
  try {
    if (!auth || !auth.app) {
      console.error('Firebase auth not properly initialized');
      return false;
    }
    
    const config = auth.app.options;
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      console.error('Missing required Firebase configuration');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating Firebase config:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('🔥 Initializing Firebase Auth...');
    
    if (!validateFirebaseConfig()) {
      setError('Firebase configuration is invalid. Please contact support.');
      setLoading(false);
      return;
    }

    // Check for redirect result first
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('✅ Sign-in via redirect successful:', result.user.email);
        }
      } catch (error) {
        console.error('❌ Redirect result error:', error);
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('👤 User authenticated:', firebaseUser.email);
          
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || userData.name || 'Unknown User',
              role: userData.role || 'student',
              avatar: firebaseUser.photoURL || undefined,
              createdAt: userData.createdAt || new Date()
            });
          } else {
            // Create new user profile
            const newUser: AppUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || 'Unknown User',
              role: 'student' as UserRole,
              avatar: firebaseUser.photoURL || undefined,
              createdAt: new Date()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              createdAt: newUser.createdAt,
              lastLogin: new Date()
            });

            setUser(newUser);
          }
          
          setError(null);
          setRetryCount(0);
        } else {
          console.log('👤 User signed out');
          setUser(null);
        }
      } catch (err) {
        console.error('❌ Error in auth state change:', err);
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const createGoogleProvider = (): GoogleAuthProvider => {
    const provider = new GoogleAuthProvider();
    
    // Configure provider with additional settings
    provider.setCustomParameters({
      prompt: 'select_account',
      hd: undefined // Allow any domain
    });

    // Add required scopes
    provider.addScope('email');
    provider.addScope('profile');
    
    return provider;
  };

  const login = async (): Promise<void> => {
    console.log('🚀 Starting Google sign-in...');
    setLoading(true);
    setError(null);

    if (!validateFirebaseConfig()) {
      setError('Firebase configuration is invalid. Please contact support.');
      setLoading(false);
      return;
    }

    try {
      const provider = createGoogleProvider();

      console.log('🔧 Attempting popup sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Popup sign-in successful:', result.user.email);
      
      // Update last login time
      await setDoc(doc(db, 'users', result.user.uid), {
        lastLogin: new Date()
      }, { merge: true });
      
    } catch (err: any) {
      console.error('❌ Popup sign-in failed:', err);
      
      // If popup fails, try redirect as fallback
      if (err.code === 'auth/popup-blocked' || 
          err.code === 'auth/popup-closed-by-user' ||
          err.code === 'auth/cancelled-popup-request') {
        
        try {
          console.log('🔄 Falling back to redirect sign-in...');
          const provider = createGoogleProvider();
          await signInWithRedirect(auth, provider);
          // Don't set error here as redirect will reload the page
          return;
        } catch (redirectErr) {
          console.error('❌ Redirect sign-in also failed:', redirectErr);
          const errorMessage = getErrorMessage(redirectErr);
          setError(errorMessage);
        }
      } else {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const retryLogin = async (): Promise<void> => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page and try again.');
      return;
    }

    setRetryCount(prev => prev + 1);
    console.log(`🔄 Retry attempt ${retryCount + 1}/3`);
    
    // Add delay between retries
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    
    return login();
  };

  const logout = async (): Promise<void> => {
    console.log('👋 Signing out...');
    setLoading(true);
    setError(null);
    
    try {
      await auth.signOut();
      console.log('✅ Sign-out successful');
    } catch (err) {
      console.error('❌ Sign-out error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    retryLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};