import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Product } from '../types';
import { FALLBACK_PRODUCTS, GOOGLE_SHEET_CSV_URL, WEARS_GOOGLE_SHEET_CSV_URL, BEST_SELLERS_GOOGLE_SHEET_CSV_URL, FALLBACK_WEARS, FALLBACK_BEST_SELLERS } from '../constants';
import { collection, getDocs, doc, getDoc, getDocFromCache, getDocsFromCache } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEFAULT_FOOTWEAR_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop';

// Global memory cache for instant tab navigation and 0ms re-rendering
let cachedProducts: Product[] | null = null;
let cachedWears: Product[] | null = null;
let cachedBestSellers: Product[] | null = null;
let cachedCategories: string[] | null = null;
let cachedWearsCategories: string[] | null = null;

// Initial hydration from memory or localStorage
const getInitialProducts = (): Product[] => {
  if (cachedProducts && cachedProducts.length > 0) return cachedProducts;
  try {
    const saved = localStorage.getItem('dams_cached_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return FALLBACK_PRODUCTS;
};

const getInitialBestSellers = (): Product[] => {
  if (cachedBestSellers && cachedBestSellers.length > 0) return cachedBestSellers;
  try {
    const saved = localStorage.getItem('dams_cached_bestsellers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return FALLBACK_BEST_SELLERS;
};

export const useProducts = () => {
  const initialProducts = getInitialProducts();
  const initialBestSellers = getInitialBestSellers();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [wears, setWears] = useState<Product[]>(cachedWears || FALLBACK_WEARS);
  const [bestSellers, setBestSellers] = useState<Product[]>(initialBestSellers);
  const [categories, setCategories] = useState<string[]>(
    cachedCategories || ['All', ...new Set(initialProducts.map(p => p.category).filter(Boolean))]
  );
  const [wearsCategories, setWearsCategories] = useState<string[]>(cachedWearsCategories || ['All']);
  const [loading, setLoading] = useState(!cachedProducts && !localStorage.getItem('dams_cached_products'));

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        // Fast retrieval from localStorage first
        let primarySheetUrl = 
          localStorage.getItem('custom_sheet_url') || 
          localStorage.getItem('custom_treats_sheet_url') || 
          GOOGLE_SHEET_CSV_URL;
        let secondaryWearsUrl = 
          localStorage.getItem('custom_wears_sheet_url') || 
          WEARS_GOOGLE_SHEET_CSV_URL;
        let bestSellersUrl = 
          localStorage.getItem('custom_bestsellers_sheet_url') || 
          BEST_SELLERS_GOOGLE_SHEET_CSV_URL;

        // Graceful read of remote settings without throwing or warning on offline
        if (typeof navigator === 'undefined' || navigator.onLine) {
          try {
            let settingsSnap = null;
            try {
              settingsSnap = await getDoc(doc(db, 'settings', 'google_sheets'));
            } catch {
              try {
                settingsSnap = await getDocFromCache(doc(db, 'settings', 'google_sheets'));
              } catch {}
            }

            if (settingsSnap && settingsSnap.exists()) {
              const data = settingsSnap.data();
              if (data.sheetUrl || data.treatsUrl) {
                primarySheetUrl = (data.sheetUrl || data.treatsUrl).trim();
                localStorage.setItem('custom_sheet_url', primarySheetUrl);
              }
              if (data.wearsUrl) {
                secondaryWearsUrl = data.wearsUrl.trim();
                localStorage.setItem('custom_wears_sheet_url', secondaryWearsUrl);
              }
              if (data.bestSellersUrl) {
                bestSellersUrl = data.bestSellersUrl.trim();
                localStorage.setItem('custom_bestsellers_sheet_url', bestSellersUrl);
              }
            }
          } catch {
            // Silently use localStorage fallbacks
          }
        }

        // 1. Fetch Firestore uploaded products
        const fetchDbPromise = (async () => {
          const dbProducts: Product[] = [];
          try {
            let querySnapshot = null;
            try {
              querySnapshot = await getDocs(collection(db, 'products'));
            } catch {
              try {
                querySnapshot = await getDocsFromCache(collection(db, 'products'));
              } catch {}
            }

            if (querySnapshot) {
              querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                dbProducts.push({
                  id: docSnap.id,
                  name: data.name || '',
                  price: Number(data.price) || 0,
                  category: data.category || 'Leather Palm',
                  image: data.image || DEFAULT_FOOTWEAR_IMAGE,
                  description: data.description || '',
                  productType: 'wear'
                });
              });
            }
          } catch {
            // Silently swallow database error
          }

          // Also merge any locally cached offline submissions
          try {
            const localSaved = localStorage.getItem('dams_local_products');
            if (localSaved) {
              const localList: Product[] = JSON.parse(localSaved);
              if (Array.isArray(localList)) {
                dbProducts.push(...localList);
              }
            }
          } catch {}

          return dbProducts;
        })();

        // 2. Fetch Primary Google Sheets catalog (Footwear: Leather Palms, Sandals, Slides, Corporate)
        const fetchPrimarySheetPromise = (async () => {
          if (!primarySheetUrl) return FALLBACK_PRODUCTS;
          try {
            // 5-minute cache rounder to guarantee freshness without spamming sheets
            const cbRounded = Math.floor(Date.now() / 300000);
            const separator = primarySheetUrl.includes('?') ? '&' : '?';
            const response = await fetch(`${primarySheetUrl}${separator}cb=${cbRounded}`);
            
            if (response.ok) {
              const csvText = await response.text();
              return new Promise<Product[]>((resolve) => {
                Papa.parse(csvText, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => {
                    const parsed = results.data
                      .filter((row: any) => row.name && row.price !== undefined)
                      .map((row: any, index: number) => ({
                        id: row.id ? String(row.id) : `p_${index + 1}`,
                        name: String(row.name).trim(),
                        price: Number(String(row.price).replace(/[^0-9.-]+/g, "")) || 0,
                        category: row.category ? String(row.category).trim() : 'Leather Palm',
                        image: row.image ? String(row.image).trim() : DEFAULT_FOOTWEAR_IMAGE,
                        description: row.description ? String(row.description).trim() : 'Handcrafted premium footwear from Dams Collection.',
                        productType: 'wear' as const
                      }));

                    resolve(parsed.length > 0 ? parsed : FALLBACK_PRODUCTS);
                  },
                  error: () => resolve(FALLBACK_PRODUCTS)
                });
              });
            }
          } catch {
            // Silent fallback to local constants
          }
          return FALLBACK_PRODUCTS;
        })();

        // 3. Fetch Optional Secondary Sheet (if configured)
        const fetchSecondarySheetPromise = (async () => {
          if (!secondaryWearsUrl) return [];
          try {
            const cbRounded = Math.floor(Date.now() / 300000);
            const separator = secondaryWearsUrl.includes('?') ? '&' : '?';
            const response = await fetch(`${secondaryWearsUrl}${separator}cb=${cbRounded}`);
            if (response.ok) {
              const csvText = await response.text();
              return new Promise<Product[]>((resolve) => {
                Papa.parse(csvText, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => {
                    const parsed = results.data
                      .filter((row: any) => row.name && row.price !== undefined)
                      .map((row: any, index: number) => ({
                        id: `sec_${row.id || index + 1}`,
                        name: String(row.name).trim(),
                        price: Number(String(row.price).replace(/[^0-9.-]+/g, "")) || 0,
                        category: row.category ? String(row.category).trim() : 'Sandals',
                        image: row.image ? String(row.image).trim() : DEFAULT_FOOTWEAR_IMAGE,
                        description: row.description ? String(row.description).trim() : '',
                        productType: 'wear' as const
                      }));
                    resolve(parsed);
                  },
                  error: () => resolve([])
                });
              });
            }
          } catch {}
          return [];
        })();

        // 4. Fetch Optional Dedicated Best Sellers Sheet (if configured)
        const fetchBestSellersPromise = (async () => {
          if (!bestSellersUrl) return [];
          try {
            const cbRounded = Math.floor(Date.now() / 300000);
            const separator = bestSellersUrl.includes('?') ? '&' : '?';
            const response = await fetch(`${bestSellersUrl}${separator}cb=${cbRounded}`);
            if (response.ok) {
              const csvText = await response.text();
              return new Promise<Product[]>((resolve) => {
                Papa.parse(csvText, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => {
                    const parsed = results.data
                      .filter((row: any) => row.name && row.price !== undefined)
                      .map((row: any, index: number) => ({
                        id: `bs_${row.id || index + 1}`,
                        name: String(row.name).trim(),
                        price: Number(String(row.price).replace(/[^0-9.-]+/g, "")) || 0,
                        category: row.category ? String(row.category).trim() : 'Best Seller',
                        image: row.image ? String(row.image).trim() : DEFAULT_FOOTWEAR_IMAGE,
                        description: row.description ? String(row.description).trim() : '',
                        productType: 'wear' as const
                      }));
                    resolve(parsed);
                  },
                  error: () => resolve([])
                });
              });
            }
          } catch {}
          return [];
        })();

        // Execute all queries in parallel for peak performance
        const [dbProducts, sheetProducts, secondaryProducts, customBestSellers] = await Promise.all([
          fetchDbPromise,
          fetchPrimarySheetPromise,
          fetchSecondarySheetPromise,
          fetchBestSellersPromise
        ]);

        if (!isMounted) return;

        // Merge products without duplicates (prefer latest)
        const productMap = new Map<string, Product>();
        sheetProducts.forEach(p => productMap.set(p.id, p));
        secondaryProducts.forEach(p => productMap.set(p.id, p));
        dbProducts.forEach(p => productMap.set(p.id, p));

        const consolidatedProducts = Array.from(productMap.values());
        const finalProducts = consolidatedProducts.length > 0 ? consolidatedProducts : FALLBACK_PRODUCTS;

        // Determine best sellers: use dedicated sheet if present, or first items/flagged
        let finalBestSellers = customBestSellers.length > 0 
          ? customBestSellers 
          : finalProducts.slice(0, 6);

        const categorySet = new Set<string>();
        categorySet.add('All');
        finalProducts.forEach(p => {
          if (p.category) categorySet.add(p.category);
        });
        const finalCategories = Array.from(categorySet);

        // Update memory cache
        cachedProducts = finalProducts;
        cachedWears = finalProducts;
        cachedBestSellers = finalBestSellers;
        cachedCategories = finalCategories;
        cachedWearsCategories = finalCategories;

        // Persist to local storage for instant offline loads
        try {
          localStorage.setItem('dams_cached_products', JSON.stringify(finalProducts));
          localStorage.setItem('dams_cached_bestsellers', JSON.stringify(finalBestSellers));
        } catch {}

        setProducts(finalProducts);
        setWears(finalProducts);
        setBestSellers(finalBestSellers);
        setCategories(finalCategories);
        setWearsCategories(finalCategories);
      } catch (err) {
        // Safe silent fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, wears, bestSellers, categories, wearsCategories, loading };
};
