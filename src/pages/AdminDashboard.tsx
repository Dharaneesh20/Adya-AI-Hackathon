import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, AlertCircle, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import UserManagement from '@/components/admin/UserManagement';
import ClaimVerification from '@/components/admin/ClaimVerification';
import { getAnalytics } from '@/services/firestore';

interface Analytics {
  totalUsers: number;
  totalLaundryRequests: number;
  totalLostItems: number;
  pendingClaims: number;
  laundryByStatus: {
    pending: number;
    in_progress: number;
    ready: number;
    completed: number;
  };
  lostItemsByStatus: {
    available: number;
    claimed: number;
    returned: number;
  };
  monthlyTrends: {
    month: string;
    laundryRequests: number;
    lostItems: number;
  }[];
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'claims'>('overview');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-8 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === 'claims'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Claim Verification
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : analytics ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Laundry Requests</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalLaundryRequests}</p>
                      </div>
                      <Package className="w-8 h-8 text-green-500" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lost Items</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalLostItems}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-orange-500" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.pendingClaims}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-500" />
                    </div>
                  </Card>
                </div>

                {/* Status Breakdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Laundry Status */}
                  <Card className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Laundry Requests by Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="text-sm font-medium text-orange-600">{analytics.laundryByStatus.pending}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <span className="text-sm font-medium text-blue-600">{analytics.laundryByStatus.in_progress}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ready</span>
                        <span className="text-sm font-medium text-green-600">{analytics.laundryByStatus.ready}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="text-sm font-medium text-gray-600">{analytics.laundryByStatus.completed}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Lost Items Status */}
                  <Card className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lost Items by Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Available</span>
                        <span className="text-sm font-medium text-green-600">{analytics.lostItemsByStatus.available}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Claimed</span>
                        <span className="text-sm font-medium text-orange-600">{analytics.lostItemsByStatus.claimed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Returned</span>
                        <span className="text-sm font-medium text-blue-600">{analytics.lostItemsByStatus.returned}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Monthly Trends */}
                <Card className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Laundry Requests
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lost Items
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.monthlyTrends.map((trend, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {trend.month}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trend.laundryRequests}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trend.lostItems}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load analytics</h3>
                <p className="text-gray-500">Please try refreshing the page.</p>
              </Card>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && <UserManagement />}

        {/* Claim Verification Tab */}
        {activeTab === 'claims' && <ClaimVerification />}
      </main>
    </div>
  );
};

export default AdminDashboard;