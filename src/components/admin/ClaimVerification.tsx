import React, { useState } from 'react';
import { Check, X, Eye, MessageSquare, Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLostItems } from '@/hooks/useLostItems';

const ClaimVerification: React.FC = () => {
  const { items, verifyItem } = useLostItems();
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const claimedItems = items.filter(item => item.status === 'claimed');

  const handleVerification = async (itemId: string, approved: boolean) => {
    setProcessing(true);
    try {
      await verifyItem(itemId, approved, adminNotes);
      setSelectedClaim(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error verifying claim:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (claimedItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims to Review</h3>
        <p className="text-gray-600">All lost item claims have been processed.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Pending Claim Verifications ({claimedItems.length})
        </h2>
      </div>

      <div className="grid gap-6">
        {claimedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="grid md:grid-cols-3 gap-6 p-6">
              {/* Item Image & Info */}
              <div>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mt-3">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <MapPin className="w-3 h-3" />
                  <span>{item.location}</span>
                </div>
              </div>

              {/* Claim Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Claim Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Claimed by:</span>
                    <p className="text-sm text-gray-600">{item.claimedByName || 'Student'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Description:</span>
                    <p className="text-sm text-gray-600">{item.claimDescription}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Contact:</span>
                    <p className="text-sm text-gray-600">{item.contactInfo}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Claimed on:</span>
                    <p className="text-sm text-gray-600">
                      {item.claimedAt ? new Date(item.claimedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Admin Actions</h4>
                <div className="space-y-3">
                  <textarea
                    value={selectedClaim === item.id ? adminNotes : ''}
                    onChange={(e) => {
                      setSelectedClaim(item.id);
                      setAdminNotes(e.target.value);
                    }}
                    placeholder="Admin notes (optional)"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVerification(item.id, true)}
                      loading={processing && selectedClaim === item.id}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVerification(item.id, false)}
                      loading={processing && selectedClaim === item.id}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClaimVerification;