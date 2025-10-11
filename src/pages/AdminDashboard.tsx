import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, AlertCircle, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import UserManagement from '@/components/admin/UserManagement';
import ClaimVerification from '@/components/admin/ClaimVerification';
import { getAnalytics } from '@/services/firestore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Analytics {
  totalUsers: number;
  laundryRequests: {
    total: number;
    pending: number;
    inProcess: number;
    completed: number;
  };
  lostItems: {
    total: number;
    claimed: number;
    pending: number;
  };
  responseTime: number;
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'claims'>('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, verify claims, and monitor system performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline-block mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'claims'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlertCircle className="w-5 h-5 inline-block mr-2" />
            Claim Verification
          </button>
        </div>

        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Laundry Requests</p>
                    <p className="text-2xl font-bold text-green-800">{analytics.laundryRequests.total}</p>
                  </div>
                  <Package className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Lost Items</p>
                    <p className="text-2xl font-bold text-purple-800">{analytics.lostItems.total}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Response Time</p>
                    <p className="text-blue-800">&lt; 300ms</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
              </Card>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Laundry Operations</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Requests</span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {analytics.laundryRequests.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Process</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {analytics.laundryRequests.inProcess}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {analytics.laundryRequests.completed}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lost & Found</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Claims</span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {analytics.lostItems.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Items Claimed</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {analytics.lostItems.claimed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Recovery Rate</span>
                    <span className="text-lg font-semibold text-green-600">
                      {analytics.lostItems.total > 0 
                        ? Math.round((analytics.lostItems.claimed / analytics.lostItems.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* System Health */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-green-800">Uptime</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">&lt; 300ms</div>
                  <div className="text-sm text-blue-800">Response Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-purple-800">Critical Issues</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'claims' && <ClaimVerification />}
      </div>
    </div>
  );
};

export default AdminDashboard;