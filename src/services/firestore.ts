import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LaundryRequest, LostItem, UserProfile } from '@/types';

// User Profile Services
export const createUserProfile = async (profile: Omit<UserProfile, 'createdAt'>) => {
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Laundry Request Services
export const createLaundryRequest = async (request: Omit<LaundryRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'laundryRequests'), {
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating laundry request:', error);
    throw error;
  }
};

export const updateLaundryRequestStatus = async (requestId: string, status: string, notes?: string) => {
  try {
    await updateDoc(doc(db, 'laundryRequests', requestId), {
      status,
      notes: notes || '',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating laundry request status:', error);
    throw error;
  }
};

export const getLaundryRequests = (userId?: string, onUpdate?: (requests: LaundryRequest[]) => void) => {
  try {
    let q = collection(db, 'laundryRequests');
    
    if (userId) {
      q = query(
        collection(db, 'laundryRequests'),
        where('studentId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'laundryRequests'), orderBy('createdAt', 'desc'));
    }

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const requests: LaundryRequest[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          pickupDate: doc.data().pickupDate?.toDate() || new Date(),
          deliveryDate: doc.data().deliveryDate?.toDate(),
        } as LaundryRequest));
        onUpdate(requests);
      });
    } else {
      return getDocs(q).then(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          pickupDate: doc.data().pickupDate?.toDate() || new Date(),
          deliveryDate: doc.data().deliveryDate?.toDate(),
        } as LaundryRequest));
      });
    }
  } catch (error) {
    console.error('Error getting laundry requests:', error);
    throw error;
  }
};

// Lost Item Services
export const createLostItem = async (item: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'lostItems'), {
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating lost item:', error);
    throw error;
  }
};

export const claimLostItem = async (itemId: string, claimantId: string, description: string) => {
  try {
    await updateDoc(doc(db, 'lostItems', itemId), {
      claimedBy: claimantId,
      claimDescription: description,
      status: 'claimed',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error claiming lost item:', error);
    throw error;
  }
};

export const verifyItemClaim = async (itemId: string, approved: boolean, adminNotes?: string) => {
  try {
    const newStatus = approved ? 'returned' : 'found';
    await updateDoc(doc(db, 'lostItems', itemId), {
      status: newStatus,
      adminNotes: adminNotes || '',
      verifiedAt: new Date(),
      updatedAt: new Date(),
      ...(approved && { returnedAt: new Date() }),
      ...(!approved && { claimedBy: null, claimDescription: null }),
    });
  } catch (error) {
    console.error('Error verifying item claim:', error);
    throw error;
  }
};

export const getLostItems = (onUpdate?: (items: LostItem[]) => void) => {
  try {
    const q = query(collection(db, 'lostItems'), orderBy('createdAt', 'desc'));

    if (onUpdate) {
      return onSnapshot(q, (snapshot) => {
        const items: LostItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          foundAt: doc.data().foundAt?.toDate(),
          returnedAt: doc.data().returnedAt?.toDate(),
          verifiedAt: doc.data().verifiedAt?.toDate(),
        } as LostItem));
        onUpdate(items);
      });
    } else {
      return getDocs(q).then(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          foundAt: doc.data().foundAt?.toDate(),
          returnedAt: doc.data().returnedAt?.toDate(),
          verifiedAt: doc.data().verifiedAt?.toDate(),
        } as LostItem));
      });
    }
  } catch (error) {
    console.error('Error getting lost items:', error);
    throw error;
  }
};

// Analytics Services
export const getAnalytics = async () => {
  try {
    const [usersSnapshot, requestsSnapshot, itemsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'laundryRequests')),
      getDocs(collection(db, 'lostItems')),
    ]);

    const requests = requestsSnapshot.docs.map(doc => doc.data());
    const items = itemsSnapshot.docs.map(doc => doc.data());

    return {
      totalUsers: usersSnapshot.size,
      totalLaundryRequests: requestsSnapshot.size,
      totalLostItems: itemsSnapshot.size,
      pendingClaims: items.filter(item => item.status === 'claimed').length,
      completedRequests: requests.filter(req => req.status === 'delivered').length,
      activeUsers: usersSnapshot.docs.filter(doc => {
        const data = doc.data();
        const lastActive = data.lastActive?.toDate();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return lastActive && lastActive > thirtyDaysAgo;
      }).length,
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
};