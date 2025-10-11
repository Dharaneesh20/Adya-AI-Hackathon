import React, { useState } from 'react';
import { Package, Plus, Clock, CheckCircle, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LaundryList from '@/components/laundry/LaundryList';
import { LostItemForm } from '@/components/lost-found/LostItemForm';
import { LostItemGrid } from '@/components/lost-found/LostItemGrid';
import { useLaundryRequests } from '@/hooks/useLaundryRequests';
import { useLostItems } from '@/hooks/useLostItems';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'lost-items'>('requests');
  const [showLostItemForm, setShowLostItemForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const { 
    requests, 
    loading: laundryLoading, 
    error: laundryError,
    updateStatus 
  } = useLaundryRequests();
  
  const { items: lostItems, loading: lostItemsLoading } = useLostItems();

  // Filter requests based on status
  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  );

  // Get status counts for quick overview
  const getStatusCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      inProcess: requests.filter(r => r.status === 'inProcess').length,
      ready: requests.filter(r => r.status === 'ready').length,
      total: requests.length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">Manage laundry requests and log found items</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <Package className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Total Requests</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center">
              <Clock className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center">
              <Package className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">In Process</p>
                <p className="text-2xl font-bold">{statusCounts.inProcess}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Ready</p>
                <p className="text-2xl font-bold">{statusCounts.ready}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Laundry Requests
          </button>
          <button
            onClick={() => setActiveTab('lost-items')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'lost-items'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lost & Found
          </button>
        </div>

        {/* Laundry Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="inProcess">In Process</option>
                  <option value="ready">Ready for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Requests List */}
            {laundryLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading laundry requests...</p>
              </div>
            ) : laundryError ? (
              <Card className="p-8 text-center">
                <p className="text-red-600 mb-4">{laundryError}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </Card>
            ) : filteredRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-500">
                  {statusFilter === 'all' 
                    ? 'No laundry requests available at the moment.'
                    : `No ${statusFilter} requests found.`}
                </p>
              </Card>
            ) : (
              <LaundryList 
                requests={filteredRequests} 
                showActions={true}
                onStatusUpdate={updateStatus}
              />
            )}
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeTab === 'lost-items' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Lost & Found Management</h2>
                <p className="text-gray-600">Log found items and manage claims</p>
              </div>
              <Button
                onClick={() => setShowLostItemForm(true)}
                className="flex items-center bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Found Item
              </Button>
            </div>

            {lostItemsLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading lost items...</p>
              </div>
            ) : (
              <LostItemGrid />
            )}

            {/* Log Found Item Modal */}
            {showLostItemForm && (
              <LostItemForm
                isOpen={showLostItemForm}
                onClose={() => setShowLostItemForm(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;