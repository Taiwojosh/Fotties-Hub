import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { WHATSAPP_NUMBER } from '../constants';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const isZeroPrice = product.price === 0;

  const handleInquire = () => {
    const message = `Hello Doms Collection! I'm interested in the "${product.name}". Could you please provide more details and pricing?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-2xl text-brand-brown hover:bg-black hover:text-white transition-all duration-300 z-10"
            >
              <X size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
            </button>
            <div className="relative w-full aspect-square overflow-hidden shrink-0">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 bg-butter flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold bg-brand-gold/5 px-3 py-1 rounded-full inline-block mb-3">
                    {product.category}
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-brand-brown leading-tight">
                    {product.name}
                  </h2>
                </div>
                <div className="text-lg font-bold text-brand-brown/90 whitespace-nowrap bg-white px-4 py-2 rounded-2xl shadow-sm border border-brand-brown/5">
                  {isZeroPrice ? 'Price Varies' : `₦${product.price.toLocaleString()}`}
                </div>
              </div>
              <p className="text-brand-brown/60 mb-10 leading-relaxed whitespace-pre-wrap text-[13px] border-t border-brand-brown/10 pt-6 italic font-light">
                {product.description || 'No description available for this premium selection.'}
              </p>
              
              <div className="pt-2">
                {isZeroPrice ? (
                  <button
                    onClick={handleInquire}
                    className="w-full bg-brand-brown text-white font-bold py-5 px-8 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 group"
                  >
                    <MessageCircle size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="group-hover:scale-110 transition-transform" />
                    Inquire on WhatsApp
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="w-full bg-brand-brown text-white font-bold py-5 px-8 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 group"
                  >
                    <Plus size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="group-hover:rotate-90 transition-transform" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
