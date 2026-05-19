import React from 'react';
import { motion } from 'motion/react';
import { Clock, Package, ChevronRight, Calendar, MapPin, Phone } from 'lucide-react';
import { Order, CartItem } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onReorder: (items: CartItem[]) => void;
  onContinueShopping?: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onReorder, onContinueShopping }) => {
  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 border-t border-brand-brown/10 mt-12 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-brand-brown/5 p-12 rounded-[3rem] mb-10 relative">
          <Package size={80} strokeWidth={1} className="text-brand-brown/5" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Package size={48} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="text-brand-gold" />
          </motion.div>
        </div>
        <h2 className="text-4xl font-serif font-black text-brand-brown mb-4 tracking-tighter">No past <br/> orders yet</h2>
        <p className="text-brand-brown/40 mb-12 max-w-xs leading-relaxed italic font-light">Your history with us is about to begin. Every extraordinary journey starts with a single step.</p>
        <button onClick={onContinueShopping} className="btn-primary px-14 py-5 shadow-2xl shadow-brand-brown/20 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px]">
          Discover Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 border-t border-brand-brown/10 mt-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-brand-gold/20 rounded-2xl">
          <Clock className="text-brand-brown" size={24} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-brand-brown">Your Past Orders</h2>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl overflow-hidden border border-brand-brown/5 hover:border-brand-gold/30 transition-all group"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-brown/40 text-xs font-bold uppercase tracking-widest mb-1">
                    <Calendar size={14} />
                    {new Date(order.date).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <h3 className="text-lg font-bold text-brand-brown">Order #{order.id.slice(-6).toUpperCase()}</h3>
                  {order.status && (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-4 py-1 bg-brand-gold text-brand-brown text-xs font-bold rounded-full uppercase tracking-wider">
                    ₦{order.total.toLocaleString()}
                  </div>
                  <button 
                    onClick={() => onReorder(order.items)}
                    className="text-xs font-bold text-brand-gold hover:text-brand-brown transition-colors uppercase tracking-widest flex items-center gap-1"
                  >
                    Reorder <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-brown/40">Items</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-brand-brown/80">
                        <span className="font-bold text-brand-brown">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="text-brand-brown/60">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-brown/40">Delivery Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-brown/5 rounded-lg">
                        <Phone size={14} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-brown/40 uppercase">Phone</p>
                        <p className="text-sm font-medium text-brand-brown">{order.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-brown/5 rounded-lg">
                        <MapPin size={14} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-brown/40 uppercase">Address</p>
                        <p className="text-sm font-medium text-brand-brown leading-relaxed">{order.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {order.instructions && (
                <div className="pt-4 border-t border-brand-brown/5">
                  <p className="text-[10px] font-bold text-brand-brown/40 uppercase mb-1">Special Instructions</p>
                  <p className="text-xs text-brand-brown/70 italic">"{order.instructions}"</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
