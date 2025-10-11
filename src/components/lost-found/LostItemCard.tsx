import React from 'react';
import { Calendar, MapPin, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { LostItem } from '@/types';

interface LostItemCardProps {
  item: LostItem;
  onClaim?: (item: LostItem) => void;
  showClaimButton?: boolean;
}

const LostItemCard: React.FC<LostItemCardProps> = React.memo(({
  item,
  onClaim,
  showClaimButton = false
}) => {
  const getStatusColor = (status: LostItem['status']) => {
    switch (status) {
      case 'found': return 'bg-blue-100 text-blue-800';
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: LostItem['status']) => {
    switch (status) {
      case 'found': return 'Found';
      case 'claimed': return 'Claimed';
      case 'verified': return 'Verified';
      case 'returned': return 'Returned';
    }
  };

  return (
    <Card hover className="h-full">
      {item.imageUrl && (
        <div className="mb-4">
          <img
            src={item.imageUrl}
            alt={item.description}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-gray-900">{item.description}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
            {getStatusText(item.status)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Found: {new Date(item.foundDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Location: {item.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Found by: Staff</span>
          </div>
        </div>

        {item.notes && (
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {item.notes}
          </p>
        )}

        {showClaimButton && item.status === 'found' && onClaim && (
          <Button
            onClick={() => onClaim(item)}
            className="w-full"
            variant="outline"
          >
            Claim This Item
          </Button>
        )}
      </div>
    </Card>
  );
});

LostItemCard.displayName = 'LostItemCard';

export default LostItemCard;