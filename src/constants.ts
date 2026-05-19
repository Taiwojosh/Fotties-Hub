import { Product } from './types';

// ============================================================================
// GOOGLE SHEETS INTEGRATION
// ============================================================================
export const GOOGLE_SHEET_CSV_URL: string = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ64HYxRNkxvtCTkfCVcn01NHicEqUtNkTWpHu-JuV0b0ezV6nx6r7sKP6OolJVJOoJoOCSIWQ-61Uk/pub?output=csv'; 
export const WEARS_GOOGLE_SHEET_CSV_URL: string = '';
export const BEST_SELLERS_GOOGLE_SHEET_CSV_URL: string = '';

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 's1',
    name: 'Doms Collection Classic Leather Palm',
    price: 35000,
    category: 'Leather Palm',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    description: 'Dynamic performance wrapped in a premium leather finish. Perfect for all day wear.',
    productType: 'wear'
  },
  {
    id: 's2',
    name: 'Midnight Suede Sandals',
    price: 45000,
    category: 'Sandals',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1000&auto=format&fit=crop',
    description: 'Classic sandals crafted from premium midnight blue suede.',
    productType: 'wear'
  },
  {
    id: 's3',
    name: 'Oceanic Corporate Shoes',
    price: 52000,
    category: 'Corporate',
    image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1000&auto=format&fit=crop',
    description: 'Elegant formal shoe carved from top-tier leather, perfect for the boardroom.',
    productType: 'wear'
  },
  {
    id: 's4',
    name: 'Cobalt Slides',
    price: 24000,
    category: 'Slides',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd0148de?q=80&w=1000&auto=format&fit=crop',
    description: 'Breezy, comfortable casual slides for everyday leisure.',
    productType: 'wear'
  },
  {
    id: 's5',
    name: 'Doms Collection Signature Palm',
    price: 48000,
    category: 'Leather Palm',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop',
    description: 'A limited signature leather palm fusing durability with premium aesthetics.',
    productType: 'wear'
  },
  {
    id: 's6',
    name: 'Aero Comfort Sandals',
    price: 32000,
    category: 'Sandals',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop',
    description: 'Engineered for those seeking ultra-light cushioning and responsive grip in a sandal.',
    productType: 'wear'
  }
];

export const FALLBACK_WEARS: Product[] = [];
export const FALLBACK_BEST_SELLERS: Product[] = [
  {
    id: 's1',
    name: 'Doms Collection Classic Leather Palm',
    price: 35000,
    category: 'Leather Palm',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    description: 'Dynamic performance wrapped in a premium leather finish. Perfect for all day wear.',
    productType: 'wear'
  },
  {
    id: 's3',
    name: 'Oceanic Corporate Shoes',
    price: 52000,
    category: 'Corporate',
    image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1000&auto=format&fit=crop',
    description: 'Elegant formal shoe carved from top-tier leather, perfect for the boardroom.',
    productType: 'wear'
  },
  {
    id: 's5',
    name: 'Doms Collection Signature Palm',
    price: 48000,
    category: 'Leather Palm',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop',
    description: 'A limited signature leather palm fusing durability with premium aesthetics.',
    productType: 'wear'
  }
];

export const CATEGORIES = [
  'All',
  'Leather Palm',
  'Sandals',
  'Slides',
  'Corporate',
];

export const WHATSAPP_NUMBER = '2348072562317';
export const EMAIL = 'domscollections01@gmail.com';

