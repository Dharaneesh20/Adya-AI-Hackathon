export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  createdAt: Date;
}

export interface LaundryRequest {
  id: string;
  studentId: string;
  studentName: string;
  items: string[];
  status: 'pending' | 'in-process' | 'ready' | 'delivered';
  pickupDate: Date;
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface LostItem {
  id: string;
  description: string;
  imageUrl?: string;
  foundBy: string;
  foundDate: Date;
  claimedBy?: string;
  claimDate?: Date;
  status: 'found' | 'claimed' | 'verified' | 'returned';
  location: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'laundry' | 'lost-found' | 'system';
  timestamp: Date;
  read: boolean;
}