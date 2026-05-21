import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBasket } from 'lucide-react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const Logo: React.FC<{ className?: string }> = ({ className = "h-16" }) => {
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className="flex flex-col">
        <span className="text-xl font-serif font-bold text-brand-brown leading-tight tracking-tighter uppercase whitespace-nowrap">Dams Collection</span>
        <span className="text-[10px] tracking-[0.3em] text-brand-gold font-bold uppercase">Premium Footwear</span>
      </div>
    );
  }

  return (
    <img 
      src="https://ik.imagekit.io/ifektive/Publick/20260516_091707.png?updatedAt=1779199590151" 
      alt="Dams Collection Logo" 
      className={`object-contain ${className}`}
      onError={() => {
        console.warn("Logo image failed to load, falling back to text.");
        setError(true);
      }}
    />
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView, cartCount, onOpenCart }) => {
  const navItems: { label: string; view: View }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Best Sellers', view: 'best-sellers' },
    { label: 'Shop', view: 'reels' },
    { label: 'My Orders', view: 'orders' },
    { label: 'Contact', view: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-butter/90 backdrop-blur-md border-b border-brand-brown/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <Logo className="h-16 group-hover:scale-105 transition-transform" />
          </div>

          {/* Mobile Spacer */}
          <div className="md:hidden flex-grow" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  if (item.view === 'about') {
                    if (currentView !== 'home') {
                      setView('home');
                      setTimeout(() => {
                        const el = document.getElementById('about-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      const el = document.getElementById('about-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    setView(item.view);
                  }
                }}
                className={`text-[13px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-brand-gold ${
                  currentView === item.view ? 'text-brand-gold bg-brand-gold/5 px-4 py-1 rounded-full' : 'text-brand-brown px-4 py-1'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Cart */}
            <button 
              onClick={onOpenCart}
              className="relative p-2.5 bg-brand-gold/5 rounded-2xl text-brand-brown hover:bg-brand-gold hover:text-white transition-all duration-500 hover:scale-110 active:scale-95"
            >
              <ShoppingBasket size={22} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-brand-brown text-butter text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-butter"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
