import React from 'react';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CartItem, Order } from '../types';
import { WHATSAPP_NUMBER } from '../constants';
import { getWhatsAppUrl } from '../utils';

interface CheckoutProps {
  cartItems: CartItem[];
  onSuccess: (order: Order) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cartItems, onSuccess }) => {
  const [formData, setFormData] = React.useState({
    fullName: '',
    phone: '',
    address: '',
    instructions: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = Math.random().toString(36).substr(2, 9);
    
    const newOrder: Order = {
      id: orderId,
      userId: 'guest',
      date: new Date().toISOString(),
      items: [...cartItems],
      total,
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      instructions: formData.instructions,
      status: 'pending'
    };

    try {
      // Local storage
      const existingOrders = JSON.parse(localStorage.getItem('dupsy_orders') || '[]');
      localStorage.setItem('dupsy_orders', JSON.stringify([newOrder, ...existingOrders]));

      // WhatsApp redirection
      const orderDetails = cartItems
        .map(item => `${item.name} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`)
        .join('\n');

      const message = `*New Order from Dams Collection*\n` +
        `Order ID: #${newOrder.id.toUpperCase()}\n` +
        `Name: ${formData.fullName}\n` +
        `Phone: ${formData.phone}\n` +
        `Address: ${formData.address}\n` +
        `Instructions: ${formData.instructions || 'None'}\n\n` +
        `*Order Items:*\n\n` +
        `${orderDetails}\n\n` +
        `*Total: ₦${total.toLocaleString()}*\n\n` +
        `Please confirm my order and provide delivery details.`;

      const url = getWhatsAppUrl(WHATSAPP_NUMBER, message);
      
      if (url.startsWith('whatsapp://')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank');
      }

      onSuccess(newOrder);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <h2 className="text-3xl font-serif font-bold text-brand-brown mb-8 text-center">Checkout</h2>
      
      <div className="glass-card rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-brand-brown mb-2 uppercase tracking-wider">Full Name</label>
            <input 
              type="text"
              className={`w-full bg-butter border ${errors.fullName ? 'border-red-500' : 'border-brand-brown/10'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all`}
              placeholder="John Doe"
              value={formData.fullName}
              onChange={e => {
                setFormData({...formData, fullName: e.target.value});
                if (errors.fullName) setErrors({...errors, fullName: ''});
              }}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.fullName}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-brown mb-2 uppercase tracking-wider">Phone Number</label>
            <input 
              type="tel"
              className={`w-full bg-butter border ${errors.phone ? 'border-red-500' : 'border-brand-brown/10'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all`}
              placeholder="0801 234 5678"
              value={formData.phone}
              onChange={e => {
                setFormData({...formData, phone: e.target.value});
                if (errors.phone) setErrors({...errors, phone: ''});
              }}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-brown mb-2 uppercase tracking-wider">Delivery Address</label>
            <textarea 
              rows={3}
              className={`w-full bg-butter border ${errors.address ? 'border-red-500' : 'border-brand-brown/10'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all resize-none`}
              placeholder="Your full delivery address"
              value={formData.address}
              onChange={e => {
                setFormData({...formData, address: e.target.value});
                if (errors.address) setErrors({...errors, address: ''});
              }}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.address}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-brown mb-2 uppercase tracking-wider">Special Instructions (Optional)</label>
            <textarea 
              rows={2}
              className="w-full bg-butter border border-brand-brown/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all resize-none"
              placeholder="E.g. No onions, delivery time, etc."
              value={formData.instructions}
              onChange={e => setFormData({...formData, instructions: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl bg-brand-brown text-white font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:bg-black active:scale-[0.98] shadow-xl ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>Processing... <CheckCircle2 size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.2} className="animate-pulse" /></>
              ) : (
                <>Send Order via WhatsApp <Send size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
