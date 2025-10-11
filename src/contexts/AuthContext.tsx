import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced error message helper
  const getErrorMessage = (error: AuthError | Error | unknown): string => {
    if (typeof error === 'string') return error;
    
    if (error && typeof error === 'object' && 'code' in error) {
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'auth/popup-closed-by-user':
          return 'Login was cancelled. Please try again.';
        case 'auth/popup-blocked':
          return 'Popup was blocked by browser. Please allow popups and try again, or try the redirect method.';
        case 'auth/cancelled-popup-request':
          return 'Multiple login attempts detected. Please wait and try again.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection and try again.';
        case 'auth/internal-error':
          return 'Authentication service error. Please try again later.';
        case 'auth/invalid-api-key':
          return 'Firebase API key is invalid. Please check your configuration.';
        case 'auth/configuration-not-found':
          return 'Firebase configuration error. Please contact support.';
        case 'auth/unauthorized-domain':
          return 'This domain is not authorized for authentication. Please add it to Firebase console under Authentication > Settings > Authorized domains.';
        default:
          console.error('Auth error details:', authError);
          return `Authentication error: ${authError.message || 'Unknown error occurred'}`;
      }
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as Error).message;
    }
    
    return 'An unexpected error occurred during authentication';
  };

  // Enhanced login function with fallback options
  const login = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Starting authentication process...');
      
      const provider = new GoogleAuthProvider();
      
      // Configure provider settings
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      let result;
      
      try {
        // First try popup method
        console.log('📱 Attempting popup authentication...');
        result = await signInWithPopup(auth, provider);
        console.log('✅ Popup authentication successful');
      } catch (popupError) {
        console.warn('⚠️ Popup authentication failed:', popupError);
        
        // If popup fails, try redirect as fallback
        if ((popupError as AuthError).code === 'auth/popup-blocked' || 
            (popupError as AuthError).code === 'auth/popup-closed-by-user') {
          
          console.log('🔄 Trying redirect authentication as fallback...');
          await signInWithRedirect(auth, provider);
          return; // signInWithRedirect doesn't return immediately
        }
        
        throw popupError;
      }
      
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        throw new Error('No email found in Google account. Please ensure your Google account has an email address.');
      }

      console.log('👤 Creating/updating user profile...');

      // Create or update user document
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let userData: User;

      if (userSnap.exists()) {
        // Update existing user
        userData = userSnap.data() as User;
        await setDoc(userRef, {
          ...userData,
          lastLogin: new Date().toISOString(),
          photoURL: firebaseUser.photoURL || userData.photoURL
        }, { merge: true });
        console.log('📝 Updated existing user profile');
      } else {
        // Create new user
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || '',
          role: 'student',
          roomNumber: '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await setDoc(userRef, userData);
        console.log('🆕 Created new user profile');
      }

      setUser(userData);
      console.log('✅ Authentication completed successfully');
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // Additional debugging info
      console.error('Error details:', {
        code: (error as AuthError)?.code,
        message: (error as AuthError)?.message,
        stack: (error as Error)?.stack
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚪 Logging out...');
      
      await signOut(auth);
      setUser(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser) {
          console.log('👤 User detected, fetching profile...');
          
          // Fetch user data from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            setUser(userData);
            console.log('✅ User profile loaded');
          } else {
            console.warn('⚠️ User document not found in Firestore');
            setUser(null);
          }
        } else {
          console.log('👤 No user detected');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        setError(getErrorMessage(error));
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Check for redirect result on app load
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('✅ Redirect authentication successful');
        }
      })
      .catch((error) => {
        console.error('❌ Redirect authentication failed:', error);
        setError(getErrorMessage(error));
      });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};