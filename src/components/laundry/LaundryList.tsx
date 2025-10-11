import React from 'react';
import { Clock, Package, CheckCircle, Truck } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { LaundryRequest } from '@/types';

interface LaundryListProps {
  requests: LaundryRequest[];
}

const LaundryList: React.FC<LaundryListProps> = React.memo(({ requests }) => {
  const getStatusIcon = (status: LaundryRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in-process': return <Package className="w-5 h-5 text-blue-500" />;
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'delivered': return <Truck className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: LaundryRequest['status']) => {
    switch (status) {
      case 'pending': return 'Pending Pickup';
      case 'in-process': return 'In Process';
      case 'ready': return 'Ready for Delivery';
      case 'delivered': return 'Delivered';
    }
  };

  const getStatusColor = (status: LaundryRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-process': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
    }
  };

  if (requests.length === 0) {
    return (
      <Card className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No laundry requests</h3>
        <p className="text-gray-500">Create your first laundry request to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request, index) => (
        <Card 
          key={request.id} 
          hover 
          className="animate-fade-in" 
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getStatusIcon(request.status)}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">Laundry Request</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Items: {request.items.join(', ')}
                </p>
                <p className="text-sm text-gray-500">
                  Pickup: {new Date(request.pickupDate).toLocaleDateString()} at {new Date(request.pickupDate).toLocaleTimeString()}
                </p>
                {request.notes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Notes: {request.notes}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
});

LaundryList.displayName = 'LaundryList';

export default LaundryList;