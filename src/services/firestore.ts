import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  LaundryRequest, 
  LostItem, 
  User, 
  LaundryStatus, 
  LostItemStatus 
} from '@/types';

// User Management
export const createUserProfile = async (userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userData.uid!);
    await updateDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Laundry Requests
export const createLaundryRequest = async (requestData: Partial<LaundryRequest>) => {
  try {
    const docRef = await addDoc(collection(db, 'laundryRequests'), {
      ...requestData,
      status: 'pending' as LaundryStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating laundry request:', error);
    return { success: false, error };
  }
};

export const updateLaundryRequestStatus = async (
  requestId: string, 
  status: LaundryStatus, 
  notes?: string
) => {
  try {
    const requestRef = doc(db, 'laundryRequests', requestId);
    await updateDoc(requestRef, {
      status,
      notes: notes || '',
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating laundry request:', error);
    return { success: false, error };
  }
};

export const getLaundryRequests = (
  userId?: string,
  userRole?: string,
  callback?: (requests: LaundryRequest[]) => void
) => {
  let q = query(collection(db, 'laundryRequests'));

  if (userId && userRole === 'student') {
    q = query(
      collection(db, 'laundryRequests'),
      where('studentId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  } else if (userRole === 'staff') {
    q = query(
      collection(db, 'laundryRequests'),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, 'laundryRequests'),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LaundryRequest[];
    
    if (callback) callback(requests);
  });
};

// Lost Items
export const createLostItem = async (itemData: Partial<LostItem>) => {
  try {
    const docRef = await addDoc(collection(db, 'lostItems'), {
      ...itemData,
      status: 'available' as LostItemStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating lost item:', error);
    return { success: false, error };
  }
};

export const claimLostItem = async (
  itemId: string, 
  claimData: {
    claimedBy: string;
    claimDescription: string;
    contactInfo: string;
  }
) => {
  try {
    const itemRef = doc(db, 'lostItems', itemId);
    await updateDoc(itemRef, {
      ...claimData,
      status: 'claimed' as LostItemStatus,
      claimedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error claiming lost item:', error);
    return { success: false, error };
  }
};

export const verifyItemClaim = async (
  itemId: string, 
  approved: boolean,
  adminNotes?: string
) => {
  try {
    const itemRef = doc(db, 'lostItems', itemId);
    await updateDoc(itemRef, {
      status: approved ? 'returned' : 'available' as LostItemStatus,
      adminNotes: adminNotes || '',
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error verifying item claim:', error);
    return { success: false, error };
  }
};

export const getLostItems = (callback: (items: LostItem[]) => void) => {
  const q = query(
    collection(db, 'lostItems'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LostItem[];
    
    callback(items);
  });
};

// Analytics
export const getAnalytics = async () => {
  try {
    const [laundrySnap, lostItemsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'laundryRequests')),
      getDocs(collection(db, 'lostItems')),
      getDocs(collection(db, 'users'))
    ]);

    const laundryRequests = laundrySnap.docs.map(doc => doc.data()) as LaundryRequest[];
    const lostItems = lostItemsSnap.docs.map(doc => doc.data()) as LostItem[];
    const users = usersSnap.docs.map(doc => doc.data()) as User[];

    return {
      totalLaundryRequests: laundryRequests.length,
      pendingRequests: laundryRequests.filter(r => r.status === 'pending').length,
      completedRequests: laundryRequests.filter(r => r.status === 'delivered').length,
      totalLostItems: lostItems.length,
      availableLostItems: lostItems.filter(i => i.status === 'available').length,
      returnedItems: lostItems.filter(i => i.status === 'returned').length,
      totalUsers: users.length,
      studentCount: users.filter(u => u.role === 'student').length,
      staffCount: users.filter(u => u.role === 'staff').length,
      adminCount: users.filter(u => u.role === 'admin').length
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};