import { useState, useEffect } from 'react';
import { getLaundryRequests, updateLaundryRequestStatus } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import type { LaundryRequest, LaundryStatus } from '@/types';

export const useLaundryRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LaundryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = getLaundryRequests(
      user.uid,
      user.role,
      (fetchedRequests) => {
        setRequests(fetchedRequests);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (requestId: string, status: LaundryStatus, notes?: string) => {
    try {
      const result = await updateLaundryRequestStatus(requestId, status, notes);
      if (!result.success) {
        setError('Failed to update request status');
      }
      return result;
    } catch (error) {
      setError('Error updating request status');
      return { success: false, error };
    }
  };

  const getRequestsByStatus = (status: LaundryStatus) => {
    return requests.filter(request => request.status === status);
  };

  const getRequestStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProcess: requests.filter(r => r.status === 'in-process').length,
      ready: requests.filter(r => r.status === 'ready').length,
      delivered: requests.filter(r => r.status === 'delivered').length
    };
  };

  return {
    requests,
    loading,
    error,
    updateStatus,
    getRequestsByStatus,
    getRequestStats
  };
};