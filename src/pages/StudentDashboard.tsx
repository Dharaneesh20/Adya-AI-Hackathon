import React, { useState } from 'react';
import { Plus, Package, Search, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LaundryRequestForm from '@/components/laundry/LaundryRequestForm';
import LaundryList from '@/components/laundry/LaundryList';
import { LostItemGrid } from '@/components/lost-found/LostItemGrid';
import { useLaundryRequests } from '@/hooks/useLaundryRequests';
import { useLostItems } from '@/hooks/useLostItems';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'laundry' | 'lost-found'>('laundry');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { requests, loading: laundryLoading, error: laundryError } = useLaundryRequests();
  const { items: lostItems, loading: lostItemsLoading } = useLostItems();

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.items.some(item => 
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProcessCount = requests.filter(r => r.status === 'inProcess').length;
  const readyCount = requests.filter(r => r.status === 'ready').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Manage your laundry requests and browse lost items</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <Package className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center">
              <Package className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">In Process</p>
                <p className="text-2xl font-bold">{inProcessCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <Package className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Ready for Pickup</p>
                <p className="text-2xl font-bold">{readyCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('laundry')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'laundry'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Laundry
          </button>
          <button
            onClick={() => setActiveTab('lost-found')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'lost-found'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lost & Found
          </button>
        </div>

        {/* Laundry Tab */}
        {activeTab === 'laundry' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Laundry Request
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="inProcess">In Process</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {/* Laundry List */}
            {laundryLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading your laundry requests...</p>
              </div>
            ) : laundryError ? (
              <Card className="p-8 text-center">
                <p className="text-red-600 mb-4">{laundryError}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </Card>
            ) : (
              <LaundryList 
                requests={filteredRequests} 
                showActions={false}
              />
            )}

            {/* New Request Modal */}
            {showRequestForm && (
              <LaundryRequestForm
                isOpen={showRequestForm}
                onClose={() => setShowRequestForm(false)}
              />
            )}
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeTab === 'lost-found' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Browse Lost Items</h2>
              <p className="text-gray-600">Find and claim your lost belongings</p>
            </div>

            {lostItemsLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading lost items...</p>
              </div>
            ) : (
              <LostItemGrid />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;