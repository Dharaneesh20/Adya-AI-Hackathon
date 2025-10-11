import React, { useState } from 'react';
import { Package, Plus, Clock, CheckCircle, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LaundryList from '@/components/laundry/LaundryList';
import LostItemForm from '@/components/lost-found/LostItemForm';
import LostItemGrid from '@/components/lost-found/LostItemGrid';
import { useLaundryRequests } from '@/hooks/useLaundryRequests';
import { useLostItems } from '@/hooks/useLostItems';

const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'laundry' | 'lost-found'>('laundry');
  const [showLostItemForm, setShowLostItemForm] = useState(false);
  const [laundryFilter, setLaundryFilter] = useState<'all' | 'pending' | 'in_progress' | 'ready' | 'completed'>('pending');

  const { requests, loading: laundryLoading, updateStatus } = useLaundryRequests();
  const { items: lostItems, loading: lostItemsLoading } = useLostItems();

  const filteredRequests = requests.filter(request => 
    laundryFilter === 'all' || request.status === laundryFilter
  );

  const getStatusCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      ready: requests.filter(r => r.status === 'ready').length,
      completed: requests.filter(r => r.status === 'completed').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-8 mb-8">
          <button
            onClick={() => setActiveTab('laundry')}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === 'laundry'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Laundry Management
          </button>
          <button
            onClick={() => setActiveTab('lost-found')}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === 'lost-found'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Lost & Found
          </button>
        </div>

        {/* Laundry Tab */}
        {activeTab === 'laundry' && (
          <div className="space-y-6">
            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{statusCounts.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{statusCounts.in_progress}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ready</p>
                    <p className="text-2xl font-bold text-green-600">{statusCounts.ready}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-600">{statusCounts.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-gray-500" />
                </div>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={laundryFilter}
                onChange={(e) => setLaundryFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Laundry Requests */}
            {laundryLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredRequests.length > 0 ? (
              <LaundryList 
                requests={filteredRequests} 
                onStatusUpdate={updateStatus}
                showActions={true}
              />
            ) : (
              <Card className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-500">
                  {laundryFilter !== 'all' 
                    ? `No ${laundryFilter.replace('_', ' ')} requests at the moment.`
                    : 'No laundry requests available.'
                  }
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeTab === 'lost-found' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Lost & Found Management</h2>
              <Button
                onClick={() => setShowLostItemForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Found Item</span>
              </Button>
            </div>

            {/* Lost Items Grid */}
            {lostItemsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <LostItemGrid items={lostItems} showStaffActions={true} />
            )}
          </div>
        )}

        {/* Lost Item Form Modal */}
        {showLostItemForm && (
          <LostItemForm onClose={() => setShowLostItemForm(false)} />
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;