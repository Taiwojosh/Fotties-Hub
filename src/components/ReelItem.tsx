import React from 'react';
import { motion } from 'motion/react';
import { Share2, MessageSquare, Plus } from 'lucide-react';
import { Product } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

interface ReelItemProps {
  product: Product;
  isActive: boolean;
  onAddToCart: (product: Product) => void;
  onShare: (e: React.MouseEvent, product: Product) => void;
}

export const ReelItem: React.FC<ReelItemProps> = ({ product, onAddToCart, onShare }) => {
  const isZeroPrice = product.price === 0;

  const handleInquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hello Dams Collection! I'm interested in the "${product.name}". Could you please provide more details and pricing?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden will-change-transform">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-cover brightness-[1.0]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-32 md:pb-12 z-10 flex items-end justify-between gap-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 max-w-[70%]"
        >
          <div className="flex flex-col gap-2 mb-4">
            <span className="inline-block bg-brand-gold text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] w-fit shadow-lg shadow-brand-gold/20">
              {product.category}
            </span>
            <span className="text-brand-gold font-black text-lg tracking-tighter">
              {isZeroPrice ? 'Price Varies' : `₦${product.price.toLocaleString()}`}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-xl">
            {product.name}
          </h2>
          <p className="text-white/90 text-xs md:text-sm line-clamp-2 md:line-clamp-3 drop-shadow-lg font-medium">
            {product.description}
          </p>
        </motion.div>

        {/* Action Sidebar - TikTok Style */}
        <div className="flex flex-col items-center gap-6">
          {/* Share Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button 
              onClick={(e) => onShare(e, product)}
              className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:text-brand-gold hover:bg-white/20 transition-all duration-300 shadow-lg"
            >
              <Share2 size={20} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
            </button>
            <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] opacity-60">Invite</span>
          </div>

          {/* Add to Cart / Inquire Button */}
          <div className="flex flex-col items-center gap-1.5">
            {isZeroPrice ? (
              <button 
                onClick={handleInquire}
                className="w-14 h-14 flex items-center justify-center bg-brand-brown rounded-2xl text-brand-gold shadow-xl shadow-brand-brown/30 hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <MessageSquare size={22} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-14 h-14 flex items-center justify-center bg-brand-gold rounded-2xl text-brand-brown shadow-xl shadow-brand-gold/30 hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <Plus size={22} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
              </button>
            )}
            <span className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.2em]">
              {isZeroPrice ? 'Inquire' : 'Collect'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Tag (Desktop Only) */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 z-10 hidden md:block">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
          <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">Price</p>
          <p className="text-4xl font-serif font-bold text-brand-gold">
            {isZeroPrice ? 'Varies' : `₦${product.price.toLocaleString()}`}
          </p>
        </div>
      </div>
    </div>
  );
};

