import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Product } from '../types';
import { FALLBACK_PRODUCTS, GOOGLE_SHEET_CSV_URL, WEARS_GOOGLE_SHEET_CSV_URL, BEST_SELLERS_GOOGLE_SHEET_CSV_URL, FALLBACK_WEARS, FALLBACK_BEST_SELLERS } from '../constants';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [wears, setWears] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [wearsCategories, setWearsCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setBestSellers(FALLBACK_BEST_SELLERS);
        
        // Fetch Treats
        if (GOOGLE_SHEET_CSV_URL) {
          try {
            const response = await fetch(`${GOOGLE_SHEET_CSV_URL}${GOOGLE_SHEET_CSV_URL.includes('?') ? '&' : '?'}cb=${Date.now()}`);
            if (response.ok) {
              const csvText = await response.text();
              Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  const parsedProducts = results.data
                    .filter((row: any) => row.name && row.price !== undefined)
                    .map((row: any, index) => ({
                      id: row.id || String(index + 1),
                      name: row.name,
                      price: Number(String(row.price).replace(/[^0-9.-]+/g,"")),
                      category: row.category || 'Uncategorized',
                      image: row.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
                      description: row.description || '',
                      productType: 'treat' as const
                    }));
                  
                  if (parsedProducts.length > 0) {
                    setProducts(parsedProducts);
                    setCategories(['All', ...new Set(parsedProducts.map(p => p.category))]);
                    if (!BEST_SELLERS_GOOGLE_SHEET_CSV_URL) {
                      setBestSellers(parsedProducts.slice(0, 4));
                    }
                  } else {
                    setProducts(FALLBACK_PRODUCTS);
                    setCategories(['All', ...new Set(FALLBACK_PRODUCTS.map(p => p.category))]);
                  }
                }
              });
            } else {
              throw new Error(`Treats HTTP error! status: ${response.status}`);
            }
          } catch (err) {
            console.error("Error fetching/parsing Treats CSV:", err);
            setProducts(FALLBACK_PRODUCTS);
            setCategories(['All', ...new Set(FALLBACK_PRODUCTS.map(p => p.category))]);
          }
        } else {
          setProducts(FALLBACK_PRODUCTS);
          setCategories(['All', ...new Set(FALLBACK_PRODUCTS.map(p => p.category))]);
        }

        // Fetch Wears
        if (WEARS_GOOGLE_SHEET_CSV_URL) {
          try {
            const response = await fetch(`${WEARS_GOOGLE_SHEET_CSV_URL}${WEARS_GOOGLE_SHEET_CSV_URL.includes('?') ? '&' : '?'}cb=${Date.now()}`);
            if (response.ok) {
              const csvText = await response.text();
              Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  const parsedWears = results.data
                    .filter((row: any) => row.name && row.price !== undefined)
                    .map((row: any, index) => ({
                      id: `w_${row.id || index + 1}`,
                      name: row.name,
                      price: Number(String(row.price).replace(/[^0-9.-]+/g,"")),
                      category: row.category || 'Uncategorized',
                      image: row.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
                      description: row.description || '',
                      productType: 'wear' as const
                    }));
                  
                  if (parsedWears.length > 0) {
                    setWears(parsedWears);
                    setWearsCategories(['All', ...new Set(parsedWears.map(p => p.category))]);
                  } else {
                    setWears(FALLBACK_WEARS);
                    setWearsCategories(['All', ...new Set(FALLBACK_WEARS.map(p => p.category))]);
                  }
                }
              });
            }
          } catch (err) {
            console.error("Error fetching Wears CSV:", err);
            setWears(FALLBACK_WEARS);
            setWearsCategories(['All', ...new Set(FALLBACK_WEARS.map(p => p.category))]);
          }
        } else {
          setWears(FALLBACK_WEARS);
          setWearsCategories(['All', ...new Set(FALLBACK_WEARS.map(p => p.category))]);
        }

        // Fetch Best Sellers
        if (BEST_SELLERS_GOOGLE_SHEET_CSV_URL) {
          try {
            const response = await fetch(`${BEST_SELLERS_GOOGLE_SHEET_CSV_URL}${BEST_SELLERS_GOOGLE_SHEET_CSV_URL.includes('?') ? '&' : '?'}cb=${Date.now()}`);
            if (response.ok) {
              const csvText = await response.text();
              Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  const parsed = results.data
                    .filter((row: any) => row.name && row.price !== undefined)
                    .map((row: any, index) => ({
                      id: `bs_${row.id || index + 1}`,
                      name: row.name,
                      price: Number(String(row.price).replace(/[^0-9.-]+/g,"")),
                      category: row.category || 'Best Seller',
                      image: row.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
                      description: row.description || '',
                      productType: 'wear' as const
                    }));
                  if (parsed.length > 0) setBestSellers(parsed);
                }
              });
            }
          } catch (err) {
            console.error("Error fetching Best Sellers CSV:", err);
          }
        }
      } catch (e) {
        console.error("Critical error in fetchProducts:", e);
      } finally {
        // Delay slightly for smoother transition, but ensure it runs
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchProducts();
  }, []);

  return { products, wears, bestSellers, categories, wearsCategories, loading };
};
