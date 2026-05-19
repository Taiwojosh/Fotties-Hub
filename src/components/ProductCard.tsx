import React, { useState } from 'react';
import { Plus, MessageSquare, Sparkle } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { WHATSAPP_NUMBER } from '../constants';
import { ProductModal } from './ProductModal';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isZeroPrice = product.price === 0;

  const handleInquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hello Doms Collection! I'm interested in the "${product.name}". Could you please provide more details and pricing?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => setIsModalOpen(true)}
        className="relative bg-white rounded-[2rem] overflow-hidden group cursor-pointer border border-brand-brown/5 hover:border-brand-gold/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-700"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-brand-brown/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="absolute top-4 left-4">
            <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              <Sparkle size={14} className="text-brand-gold" fill="currentColor" />
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
            {isZeroPrice ? (
              <button 
                onClick={handleInquire}
                className="bg-brand-brown text-brand-gold p-4 rounded-2xl shadow-2xl translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-black active:scale-95 z-10 flex items-center justify-center"
                aria-label={`Inquire about ${product.name}`}
              >
                <MessageSquare size={20} strokeWidth={1.5} fill="currentColor" fillOpacity={0.1} />
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                className="bg-brand-gold text-white p-4 rounded-2xl shadow-2xl translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:scale-105 active:scale-95 z-10"
                aria-label={`Add ${product.name} to cart`}
              >
                <Plus size={20} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
        <div className="p-5 md:p-8">
          <div className="mb-4">
            <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold/60 mb-1">
              {product.category}
            </span>
            <h3 className="text-xl md:text-3xl font-serif font-black text-brand-brown mb-3 group-hover:text-brand-gold transition-colors duration-500 leading-[0.9] tracking-tighter">
              {product.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-lg md:text-xl font-black text-brand-brown tracking-tighter">
                {isZeroPrice ? 'Price Varies' : `₦${product.price.toLocaleString()}`}
              </span>
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-brand-brown/40 line-clamp-2 leading-relaxed italic font-light">
            {product.description}
          </p>
        </div>
      </motion.div>

      <ProductModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddToCart={onAddToCart}
      />
    </>
  );
});
