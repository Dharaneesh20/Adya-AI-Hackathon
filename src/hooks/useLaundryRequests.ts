import { useState, useEffect } from 'react';
import { getLaundryRequests, updateLaundryRequestStatus } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import type { LaundryRequest } from '@/types';

export const useLaundryRequests = () => {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<LaundryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    try {
      setLoading(true);
      setError(null);

      const userId = userProfile.role === 'student' ? userProfile.uid : undefined;
      
      const unsubscribe = getLaundryRequests(userId, (updatedRequests) => {
        setRequests(updatedRequests);
        setLoading(false);
      });

      return unsubscribe as () => void;
    } catch (err: any) {
      console.error('Error fetching laundry requests:', err);
      setError(err.message || 'Failed to fetch requests');
      setLoading(false);
    }
  }, [userProfile]);

  const updateStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      await updateLaundryRequestStatus(requestId, status, notes);
    } catch (error: any) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  const getRequestsByStatus = (status: string) => {
    return requests.filter(request => request.status === status);
  };

  const getRequestStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProcess: requests.filter(r => r.status === 'inProcess').length,
      ready: requests.filter(r => r.status === 'ready').length,
      delivered: requests.filter(r => r.status === 'delivered').length,
    };
  };

  return {
    requests,
    loading,
    error,
    updateStatus,
    getRequestsByStatus,
    getRequestStats,
  };
};