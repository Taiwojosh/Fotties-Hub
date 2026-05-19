import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBasket } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  onContinueShopping
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-brand-brown/5 p-12 rounded-[3rem] mb-10 relative">
          <ShoppingBasket size={80} strokeWidth={1} className="text-brand-brown/5" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <ShoppingBasket size={48} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="text-brand-gold" />
          </motion.div>
        </div>
        <h2 className="text-4xl font-serif font-black text-brand-brown mb-4 tracking-tighter leading-tight">Your cart <br/> is empty</h2>
        <p className="text-brand-brown/40 mb-12 max-w-xs leading-relaxed italic font-light">The collection remains incomplete without your selection.</p>
        <button onClick={onContinueShopping} className="btn-primary px-14 py-5 shadow-2xl shadow-brand-brown/20 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px]">
          Begin Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h2 className="text-4xl font-serif font-black text-brand-brown mb-10 tracking-tighter">Shopping Cart</h2>
      
      <div className="space-y-8 mb-16">
        {items.map((item) => (
          <div key={item.id} className="relative bg-white rounded-[2.5rem] p-5 flex flex-col sm:flex-row gap-6 sm:items-center shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-brand-brown/5">
            <div className="flex gap-6 items-center flex-1">
              <img 
                src={item.image} 
                alt={item.name} 
                loading="lazy"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] object-cover flex-shrink-0 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-serif font-black text-brand-brown truncate tracking-tight">{item.name}</h3>
                <p className="text-brand-gold font-black tracking-tight mt-1">₦{item.price.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="flex items-center gap-4 bg-butter p-1.5 rounded-2xl border border-brand-brown/5">
                <button 
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-8 h-8 flex items-center justify-center hover:text-brand-gold transition-colors"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={14} strokeWidth={2} />
                </button>
                <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-8 h-8 flex items-center justify-center hover:text-brand-gold transition-colors"
                >
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>
              
              <div className="flex items-center gap-6 sm:flex-col sm:gap-1 sm:items-end min-w-[100px]">
                <p className="text-lg font-black text-brand-brown tracking-tighter">₦{(item.price * item.quantity).toLocaleString()}</p>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-black/[0.03] border border-brand-brown/5">
        <div className="flex justify-between items-center mb-8 border-b border-dashed border-brand-brown/10 pb-8">
          <span className="text-brand-brown/40 font-black uppercase tracking-[0.2em] text-xs">Total Commitment</span>
          <span className="text-4xl font-serif font-black text-brand-brown tracking-tighter">₦{total.toLocaleString()}</span>
        </div>
        <p className="text-[10px] text-brand-brown/30 mb-8 italic font-light text-center px-4">
          Shipping and delivery kinetics will be finalized via WhatsApp once the order is dispatched.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onContinueShopping} className="btn-secondary flex-1 py-5 rounded-[1.5rem] text-[10px] uppercase tracking-[0.2em] font-black">
            Continue Exploration
          </button>
          <button onClick={onCheckout} className="btn-primary flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-[10px] uppercase tracking-[0.2em] font-black shadow-xl shadow-brand-brown/20">
            Proceed to Checkout <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
