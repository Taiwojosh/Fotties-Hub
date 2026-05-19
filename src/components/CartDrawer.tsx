import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag } from 'lucide-react';
import { Cart } from './Cart';
import { CartItem, Order, View } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: (order?: Order) => void;
  setView: (view: View) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setView
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-butter z-[100] shadow-2xl flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-brand-brown/10 bg-white">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-brand-brown" size={24} />
                <h2 className="text-2xl font-serif font-bold text-brand-brown">Your Cart</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-brand-brown/60 hover:text-brand-brown bg-brand-brown/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <Cart 
                items={cart} 
                onUpdateQuantity={updateQuantity} 
                onRemove={removeFromCart} 
                onCheckout={() => {
                  setView('checkout');
                  onClose();
                }}
                onContinueShopping={() => {
                  setView('home');
                  onClose();
                }}
              />
              <div className="p-4 border-t border-brand-brown/10 flex justify-center">
                <button 
                  onClick={() => {
                    setView('orders');
                    onClose();
                  }}
                  className="text-sm font-bold text-brand-brown hover:text-brand-gold transition-colors underline"
                >
                  View Order History
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
