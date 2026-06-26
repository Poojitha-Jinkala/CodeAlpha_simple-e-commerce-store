export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating?: number;
  reviewsCount?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  username: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}
