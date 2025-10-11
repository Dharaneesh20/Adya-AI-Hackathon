import { useState, useEffect } from 'react';
import { getLostItems, claimLostItem, verifyItemClaim } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import type { LostItem, LostItemStatus } from '@/types';

export const useLostItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getLostItems((fetchedItems) => {
      setItems(fetchedItems);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const claimItem = async (
    itemId: string, 
    claimDescription: string, 
    contactInfo: string
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await claimLostItem(itemId, {
        claimedBy: user.uid,
        claimDescription,
        contactInfo
      });
      if (!result.success) {
        setError('Failed to claim item');
      }
      return result;
    } catch (error) {
      setError('Error claiming item');
      return { success: false, error };
    }
  };

  const verifyItem = async (itemId: string, approved: boolean, adminNotes?: string) => {
    try {
      const result = await verifyItemClaim(itemId, approved, adminNotes);
      if (!result.success) {
        setError('Failed to verify item claim');
      }
      return result;
    } catch (error) {
      setError('Error verifying item claim');
      return { success: false, error };
    }
  };

  const getItemsByStatus = (status: LostItemStatus) => {
    return items.filter(item => item.status === status);
  };

  const getItemStats = () => {
    return {
      total: items.length,
      available: items.filter(i => i.status === 'available').length,
      claimed: items.filter(i => i.status === 'claimed').length,
      returned: items.filter(i => i.status === 'returned').length
    };
  };

  return {
    items,
    loading,
    error,
    claimItem,
    verifyItem,
    getItemsByStatus,
    getItemStats
  };
};