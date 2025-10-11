import React, { useState, useEffect } from 'react';
import { Plus, Package, Search } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DashboardStats from '@/components/dashboard/DashboardStats';
import LaundryRequestForm from '@/components/laundry/LaundryRequestForm';
import LaundryList from '@/components/laundry/LaundryList';
import LostItemCard from '@/components/lost-found/LostItemCard';
import ClaimItemModal from '@/components/lost-found/ClaimItemModal';
import type { LaundryRequest, LostItem } from '@/types';

const Dashboard: React.FC = React.memo(() => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'laundry' | 'lost-found'>('laundry');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [laundryRequests, setLaundryRequests] = useState<LaundryRequest[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Subscribe to laundry requests
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'laundryRequests'),
      where('studentId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        pickupDate: doc.data().pickupDate?.toDate() || new Date(),
        deliveryDate: doc.data().deliveryDate?.toDate() || undefined,
      })) as LaundryRequest[];
      
      setLaundryRequests(requests);
    });

    return unsubscribe;
  }, [currentUser]);

  // Subscribe to lost items
  useEffect(() => {
    const q = query(
      collection(db, 'lostItems'),
      orderBy('foundDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        foundDate: doc.data().foundDate?.toDate() || new Date(),
        claimDate: doc.data().claimDate?.toDate() || undefined,
      })) as LostItem[];
      
      setLostItems(items);
    });

    return unsubscribe;
  }, []);

  const stats = {
    totalRequests: laundryRequests.length,
    pendingRequests: laundryRequests.filter(r => r.status === 'pending').length,
    completedRequests: laundryRequests.filter(r => r.status === 'delivered').length,
    lostItems: lostItems.filter(i => i.status === 'found').length
  };

  const filteredLostItems = lostItems.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClaimItem = (item: LostItem) => {
    setSelectedItem(item);
    setShowClaimModal(true);
  };

  const handleSubmitClaim = async (description: string, details: string) => {
    // In a real implementation, this would update the item in Firestore
    console.log('Claim submitted:', { description, details, item: selectedItem });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-gray-600">Manage your laundry requests and browse lost items.</p>
        </div>

        <DashboardStats stats={stats} />

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('laundry')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'laundry'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Laundry
            </button>
            <button
              onClick={() => setActiveTab('lost-found')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lost-found'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lost & Found
            </button>
          </nav>
        </div>

        {/* Laundry Tab */}
        {activeTab === 'laundry' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Laundry Requests</h2>
              <Button onClick={() => setShowRequestForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
            
            <LaundryList requests={laundryRequests} />
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeTab === 'lost-found' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Lost & Found Items</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {filteredLostItems.length === 0 ? (
              <Card className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lost items found</h3>
                <p className="text-gray-500">Check back later for newly reported items.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLostItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <LostItemCard
                      item={item}
                      onClaim={handleClaimItem}
                      showClaimButton={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <LaundryRequestForm
          isOpen={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            // Refresh handled by real-time listener
          }}
        />

        <ClaimItemModal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          item={selectedItem}
          onSubmit={handleSubmitClaim}
        />
      </main>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;