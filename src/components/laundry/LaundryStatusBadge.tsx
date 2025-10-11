import React from 'react';
import { Clock, Package, CheckCircle, Truck } from 'lucide-react';
import type { LaundryStatus } from '@/types';

interface LaundryStatusBadgeProps {
  status: LaundryStatus;
  size?: 'sm' | 'md' | 'lg';
}

const LaundryStatusBadge: React.FC<LaundryStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: LaundryStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'in-process':
        return {
          icon: Package,
          text: 'In Process',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'ready':
        return {
          icon: CheckCircle,
          text: 'Ready',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'delivered':
        return {
          icon: Truck,
          text: 'Delivered',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {config.text}
    </span>
  );
};

export default LaundryStatusBadge;