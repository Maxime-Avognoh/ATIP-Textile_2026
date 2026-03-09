
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
  phone?: string;
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

/**
 * Returns the localized value for a product field,
 * falling back to English, then French, then the first available value.
 */
export function getLocalized(
  field: { [key: string]: string } | undefined,
  locale: string
): string {
  if (!field) return '';
  return field[locale] || field['en'] || field['fr'] || Object.values(field)[0] || '';
}
