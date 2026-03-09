export interface Product {
  id: string;
  name: { [key: string]: string };
  subtitle: { [key: string]: string };
  price: number;
  description: { [key: string]: string };
  images: string[];
}

export interface CartItem extends Product {
  quantity: number;
  format: string;
  cartItemId: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface ContactInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  orderNumber: string;
  date: string;
  total: number;
  items: CartItem[];
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingInfo: ContactInfo;
  billingInfo: ContactInfo;
}