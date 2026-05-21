import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, X, ChevronUp, ChevronDown, LayoutGrid, Clapperboard, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { ReelItem } from './ReelItem';
import { ProductCard } from './ProductCard';

interface ProductReelsProps {
  products: Product[];
  categories: string[];
  onAddToCart: (product: Product) => void;
  onClose: () => void;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
}

export const ProductReels: React.FC<ProductReelsProps> = ({ 
  products, 
  categories, 
  onAddToCart, 
  onClose,
  setIsCartOpen,
  cartCount
}) => {
  const [viewMode, setViewMode] = React.useState<'reels' | 'catalogue'>('reels');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [category, setCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = String(p.name || '').toLowerCase().includes(String(searchQuery || '').toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Infinite scroll display for reels only
  const displayProducts = viewMode === 'reels' && filteredProducts.length > 0 
    ? [...filteredProducts, ...filteredProducts, ...filteredProducts] 
    : filteredProducts;

  const handleScroll = () => {
    if (viewMode === 'reels' && containerRef.current && filteredProducts.length > 0) {
      const scrollTop = containerRef.current.scrollTop;
      const itemHeight = window.innerHeight;
      const totalItems = filteredProducts.length;
      
      const rawIndex = Math.round(scrollTop / itemHeight);
      const index = rawIndex % totalItems;
      
      if (index !== activeIndex) {
        setActiveIndex(index);
      }

      if (scrollTop <= 0) {
        containerRef.current.scrollTop = itemHeight * totalItems;
      } else if (scrollTop >= itemHeight * totalItems * 2) {
        containerRef.current.scrollTop = itemHeight * totalItems;
      }
    }
  };

  React.useEffect(() => {
    if (viewMode === 'reels' && containerRef.current && filteredProducts.length > 0) {
      containerRef.current.scrollTop = window.innerHeight * filteredProducts.length;
    }
  }, [filteredProducts.length, viewMode]);

  const handleShare = async (e: React.MouseEvent, product?: Product) => {
    e.stopPropagation();
    const shareData = {
      title: 'Dams Collection Premium Footwear',
      text: product 
        ? `Check out these ${product.name} at Dams Collection! 👟✨`
        : 'Step into the extraordinary with Dams Collection Premium Footwear. ✨',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link copied! 🛍️');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] ${viewMode === 'reels' ? 'bg-black' : 'bg-butter overflow-y-auto'}`}>
      {/* Top Controls */}
      <div className={`fixed top-0 left-0 right-0 z-[70] p-6 flex justify-between items-center ${viewMode === 'reels' ? 'bg-gradient-to-b from-black/80 via-black/20 to-transparent' : 'bg-butter/90 backdrop-blur-md border-b border-brand-brown/10'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg ${viewMode === 'reels' ? 'bg-white/10 backdrop-blur-md text-brand-gold hover:bg-white/20' : 'bg-brand-brown text-butter hover:bg-black'}`}
        >
          <ArrowLeft size={24} />
        </button>

        {/* View Toggle */}
        <div className={`flex items-center rounded-full p-1 border shadow-lg ${viewMode === 'reels' ? 'bg-black/40 backdrop-blur-md border-white/10' : 'bg-white border-brand-brown/10'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); setViewMode('reels'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'reels' ? 'bg-brand-gold text-brand-brown' : 'text-brand-brown/60 hover:text-brand-brown'
            }`}
          >
            <Clapperboard size={14} />
            <span className="hidden sm:inline">Reels</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setViewMode('catalogue'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'catalogue' ? 'bg-brand-gold text-brand-brown' : (viewMode === 'reels' ? 'text-white/60 hover:text-white' : 'text-brand-brown/60 hover:text-brand-brown')
            }`}
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Catalogue</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
            className={`w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg ${showFilters ? 'bg-brand-gold text-brand-brown' : (viewMode === 'reels' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-brand-brown border border-brand-brown/10 hover:bg-brand-brown/5')}`}
          >
            <Search size={24} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setIsCartOpen(true); }}
            className={`w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg relative ${viewMode === 'reels' ? 'bg-white/10 text-brand-gold hover:bg-white/20' : 'bg-white text-brand-brown border border-brand-brown/10 hover:bg-brand-brown/5'}`}
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-brand-brown text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 ${viewMode === 'reels' ? 'bg-brand-gold border-black' : 'bg-brand-gold border-butter'}`}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-24 left-6 right-6 z-[70] max-w-lg mx-auto"
          >
            <div 
              className={`backdrop-blur-xl rounded-3xl p-4 space-y-4 border shadow-2xl ${viewMode === 'reels' ? 'bg-white/10 border-white/10' : 'bg-white border-brand-brown/10'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${viewMode === 'reels' ? 'text-white/40' : 'text-brand-brown/40'}`} size={16} />
                <input 
                  type="text" 
                  placeholder="Search footwear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold ${viewMode === 'reels' ? 'bg-white/5 border-white/10 text-white' : 'bg-butter border-brand-brown/10 text-brand-brown'}`}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${viewMode === 'reels' ? 'text-white/40' : 'text-brand-brown/40'}`}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${category === cat ? 'bg-brand-gold text-brand-brown' : (viewMode === 'reels' ? 'bg-white/5 text-white/60 border border-white/10' : 'bg-butter text-brand-brown/60 border border-brand-brown/10')}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {viewMode === 'reels' ? (
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
          {displayProducts.length > 0 ? (
            displayProducts.map((product, index) => {
              const isActive = activeIndex === (index % filteredProducts.length);
              return (
                <ReelItem 
                  key={`${product.id}-${index}`}
                  product={product}
                  isActive={isActive}
                  onAddToCart={onAddToCart}
                  onShare={handleShare}
                />
              );
            })
          ) : (
            <div className="h-screen w-full flex items-center justify-center text-white/40 font-serif italic">
              No items found.
            </div>
          )}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 pointer-events-none opacity-40">
            <ChevronUp className="animate-bounce" />
            <ChevronDown className="animate-bounce" />
          </div>
        </div>
      ) : (
        <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-brand-brown/40 font-serif italic">
                No items found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
