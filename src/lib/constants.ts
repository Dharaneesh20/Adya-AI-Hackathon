export const LAUNDRY_STATUS = {
  PENDING: 'pending',
  PICKED_UP: 'picked_up',
  IN_PROCESS: 'in_process',
  READY: 'ready',
  DELIVERED: 'delivered',
} as const;

export const ITEM_STATUS = {
  LOST: 'lost',
  FOUND: 'found',
  CLAIMED: 'claimed',
  VERIFIED: 'verified',
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

export const CLOTHING_TYPES = [
  'Shirt',
  'T-Shirt',
  'Pants',
  'Jeans',
  'Shorts',
  'Dress',
  'Skirt',
  'Jacket',
  'Sweater',
  'Hoodie',
  'Underwear',
  'Socks',
  'Bedsheet',
  'Pillowcase',
  'Towel',
  'Other',
];

export const LOST_ITEM_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Accessories',
  'Sports Equipment',
  'Personal Items',
  'Documents',
  'Keys',
  'Other',
];

export const LOCATIONS = [
  'Main Building',
  'Library',
  'Cafeteria',
  'Gymnasium',
  'Dormitory A',
  'Dormitory B',
  'Dormitory C',
  'Laundry Room',
  'Common Area',
  'Parking Lot',
  'Garden',
  'Other',
];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;