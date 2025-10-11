import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  currentUser: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: 'student' | 'staff' | 'admin') => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setError(null);
        
        if (user) {
          setUser(user);
          await loadUserProfile(user);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user profile');
        // Don't leave user in loading state on error
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          name: userData.name || user.displayName || 'User',
          role: userData.role || 'student',
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLogin: new Date(),
        };

        // Update last login
        await setDoc(userDocRef, {
          ...userData,
          lastLogin: new Date(),
        }, { merge: true });

        setUserProfile(profile);
      } else {
        // Create new user profile with default role
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          role: 'student', // Default role
          createdAt: new Date(),
          lastLogin: new Date(),
        };

        await setDoc(userDocRef, {
          name: newProfile.name,
          email: newProfile.email,
          role: newProfile.role,
          createdAt: newProfile.createdAt,
          lastLogin: newProfile.lastLogin,
        });

        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      throw error;
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      setError(null);

      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      try {
        // Try popup first
        await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          // Fallback to redirect if popup is blocked
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await auth.signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (role: 'student' | 'staff' | 'admin') => {
    if (!user || !userProfile) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { role }, { merge: true });
      
      setUserProfile({
        ...userProfile,
        role,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    currentUser: userProfile, // Alias for backward compatibility
    userProfile,
    loading,
    error,
    login,
    logout,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;