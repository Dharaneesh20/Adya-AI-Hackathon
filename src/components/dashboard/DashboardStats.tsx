import React from 'react';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';

interface StatsProps {
  stats: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    lostItems: number;
  };
}

const DashboardStats: React.FC<StatsProps> = React.memo(({ stats }) => {
  const statItems = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: Package,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Pending',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Completed',
      value: stats.completedRequests,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Lost Items',
      value: stats.lostItems,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={item.title} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{item.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;