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
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  address: string;
  deliveryTimeSlot: string;
  paymentMethod: string;
  timeline: {
    stage: string;
    time?: string;
    description: string;
    completed: boolean;
  }[];
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
