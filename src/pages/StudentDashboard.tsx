import React, { useState } from 'react';
import { Plus, Package, Search, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LaundryRequestForm from '@/components/laundry/LaundryRequestForm';
import LaundryList from '@/components/laundry/LaundryList';
import LostItemGrid from '@/components/lost-found/LostItemGrid';
import { useLaundryRequests } from '@/hooks/useLaundryRequests';
import { useLostItems } from '@/hooks/useLostItems';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'laundry' | 'lost-found'>('laundry');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [laundryFilter, setLaundryFilter] = useState<'all' | 'pending' | 'in_progress' | 'ready' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { requests, loading: laundryLoading } = useLaundryRequests();
  const { items: lostItems, loading: lostItemsLoading } = useLostItems();

  const filteredRequests = requests.filter(request => {
    const matchesFilter = laundryFilter === 'all' || request.status === laundryFilter;
    const matchesSearch = request.items.some(item => 
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

  const filteredLostItems = lostItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            My Laundry
          </button>
          <button
            onClick={() => setActiveTab('lost-found')}
            className={`pb-2 border-b-2 font-medium transition-colors ${
              activeTab === 'lost-found'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-5 h-5 inline mr-2" />
            Lost & Found
          </button>
        </div>

        {/* Laundry Tab */}
        {activeTab === 'laundry' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
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
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search laundry items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <Button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Request</span>
              </Button>
            </div>

            {/* Laundry Requests */}
            {laundryLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredRequests.length > 0 ? (
              <LaundryList requests={filteredRequests} />
            ) : (
              <Card className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No laundry requests found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || laundryFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first laundry request.'
                  }
                </p>
                {!searchQuery && laundryFilter === 'all' && (
                  <Button onClick={() => setShowRequestForm(true)}>
                    Create First Request
                  </Button>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeTab === 'lost-found' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lost items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Lost Items Grid */}
            {lostItemsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <LostItemGrid items={filteredLostItems} />
            )}
          </div>
        )}

        {/* Laundry Request Form Modal */}
        {showRequestForm && (
          <LaundryRequestForm onClose={() => setShowRequestForm(false)} />
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;