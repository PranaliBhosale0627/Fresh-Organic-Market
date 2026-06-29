export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // e.g. 4.99
  unit: string; // e.g. "bunch (2 pcs)" or "400g" or "250g"
  image: string;
  tag?: string; // e.g. "Organic", "Pesticide Free", "Sale -20%", "Local", "Heirloom", "Washed"
  originalPrice?: number; // for sale items
  stock: number;
  maxStock: number;
  description: string;
  rating?: number;
  reviewsCount?: number;
  nutritionalFacts?: {
    calories: number;
    fat: string;
    fiber: string;
    protein: string;
    details: string;
  };
  origin?: {
    farm: string;
    location: string;
    badges: string[];
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string; // e.g. "#FO-8821945"
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  date: string; // e.g. "Oct 24, 2024"
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentStatus?: 'Pending' | 'Pending Collection' | 'Paid' | 'Failed' | 'Refunded' | 'Collected';
  address: string;
  deliveryTimeSlot: string;
  paymentMethod: string;
  deliveryStatus?: 'Unassigned' | 'Assigned' | 'Accepted' | 'Picked Up' | 'Out for Delivery' | 'Near Your Location' | 'Delivered' | 'Delivery Failed' | 'Rejected';
  assignedPartner?: DeliveryPartnerSummary | null;
  estimatedDeliveryTime?: string | null;
  deliveryOtpCode?: string | null;
  liveLocation?: {
    lat?: number;
    lng?: number;
    address?: string;
    updatedAt: string;
  } | null;
  deliveryHistory?: {
    status: string;
    changedAt: string;
    changedBy: string;
    note?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  statusHistory?: {
    status: Order['status'];
    changedAt: string;
    changedBy: string;
    note?: string;
  }[];
  timeline: {
    stage: string;
    time?: string;
    description: string;
    completed: boolean;
  }[];
}

export interface DeliveryPartnerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
  vehicleNumber: string;
  rating?: number;
}

export interface DeliveryPartner extends DeliveryPartnerSummary {
  status: 'Active' | 'Inactive';
  availability: 'Available' | 'Unavailable' | 'Busy';
  completedDeliveries: number;
  activeDeliveries: number;
  averageDeliveryTime: number;
  joinedAt?: string;
  updatedAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Resolved';
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  ordersCount: number;
  joinDate: string;
  status: 'Active' | 'Blocked';
}
