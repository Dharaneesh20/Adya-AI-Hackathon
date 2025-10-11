import React, { useState } from 'react';
import { Calendar, MapPin, User, Eye, Package } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useLostItems } from '@/hooks/useLostItems';
import { useAuth } from '@/contexts/AuthContext';
import type { LostItem } from '@/types';

interface LostItemGridProps {
  searchTerm?: string;
  categoryFilter?: string;
  statusFilter?: string;
}

const LostItemGrid: React.FC<LostItemGridProps> = ({
  searchTerm = '',
  categoryFilter = '',
  statusFilter = ''
}) => {
  const { user } = useAuth();
  const { items, loading, claimItem } = useLostItems();
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [claimDescription, setClaimDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [claiming, setClaiming] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClaim = async () => {
    if (!selectedItem || !user) return;

    setClaiming(true);
    try {
      const result = await claimItem(selectedItem.id, claimDescription, contactInfo);
      if (result.success) {
        setSelectedItem(null);
        setClaimDescription('');
        setContactInfo('');
      }
    } catch (error) {
      console.error('Error claiming item:', error);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                {user?.role === 'student' && item.status === 'available' && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                    className="flex-1"
                  >
                    Claim Item
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Item Details Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setClaimDescription('');
          setContactInfo('');
        }}
      >
        {selectedItem && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(null)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {selectedItem.title}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    Category: {selectedItem.category}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Location Found</h4>
                  <p className="text-sm text-gray-600">{selectedItem.location}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Found On</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user?.role === 'student' && selectedItem.status === 'available' && (
                <>
                  <hr className="my-4" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Claim This Item</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Why do you think this is your item? *
                        </label>
                        <textarea
                          value={claimDescription}
                          onChange={(e) => setClaimDescription(e.target.value)}
                          placeholder="Describe unique features, when you lost it, etc."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Information *
                        </label>
                        <Input
                          type="text"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          placeholder="Room number or phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedItem(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleClaim}
                      loading={claiming}
                      disabled={!claimDescription.trim() || !contactInfo.trim()}
                      className="flex-1"
                    >
                      Submit Claim
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default LostItemGrid;