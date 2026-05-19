export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  productType?: 'treat' | 'wear';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  total: number;
  fullName: string;
  phone: string;
  address: string;
  instructions?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export type View = 'home' | 'menu' | 'cart' | 'about' | 'contact' | 'checkout' | 'orders' | 'reels' | 'wears' | 'best-sellers';
