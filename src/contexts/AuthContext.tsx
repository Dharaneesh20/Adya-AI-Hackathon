import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'admin' | 'staff';
  studentId?: string;
  roomNumber?: string;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Add custom parameters for better UX
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Create or update user in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let userData: User;
      
      if (userSnap.exists()) {
        userData = userSnap.data() as User;
      } else {
        // Determine role based on email domain or default to student
        const role = firebaseUser.email?.endsWith('@admin.university.edu') ? 'admin' : 
                    firebaseUser.email?.endsWith('@staff.university.edu') ? 'staff' : 'student';
        
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          role,
          studentId: role === 'student' ? `STU${Date.now().toString().substr(-6)}` : undefined,
          roomNumber: role === 'student' ? '' : undefined,
          createdAt: new Date()
        };

        await setDoc(userRef, userData);
      }

      setCurrentUser(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(getErrorMessage(error));
      throw error;
    }
  };

  const getErrorMessage = (error: any): string => {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up blocked. Please allow pop-ups and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/internal-error':
        return 'Internal error. Please try again later.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return error.message || 'An error occurred during authentication.';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setCurrentUser(userSnap.data() as User);
          } else {
            // Handle case where Firebase user exists but Firestore doc doesn't
            const userData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || undefined,
              role: 'student',
              studentId: `STU${Date.now().toString().substr(-6)}`,
              roomNumber: '',
              createdAt: new Date()
            };
            
            await setDoc(userRef, userData);
            setCurrentUser(userData);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError('Failed to load user data. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};