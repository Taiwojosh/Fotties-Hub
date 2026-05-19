import React from 'react';
import { Instagram, Facebook, Phone, Mail, MapPin, Zap } from 'lucide-react';
import { WHATSAPP_NUMBER, EMAIL } from '../constants';
import { View } from '../types';

interface FooterProps {
  setView: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  const [logoError, setLogoError] = React.useState(false);

  const LogoFallback = () => (
    <div className="flex flex-col mb-4">
      <span className="text-2xl font-serif font-bold text-butter leading-tight tracking-tighter uppercase whitespace-nowrap">Doms Collection</span>
      <span className="text-[10px] tracking-[0.3em] text-brand-gold font-bold uppercase">Premium Footwear</span>
    </div>
  );

  return (
    <footer className="hidden md:block bg-black text-butter pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start text-left">
            {!logoError ? (
              <img 
                src="https://ik.imagekit.io/ifektive/Publick/20260516_091707.png?updatedAt=1779199590151" 
                alt="Doms Collection Logo" 
                className="h-20 object-contain mb-4 bg-white/10 rounded-xl p-2" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <LogoFallback />
            )}
            <p className="text-butter/60 text-sm leading-relaxed italic font-light">
              Crafting a legacy of extraordinary footwear. Where style meets the horizon.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-brand-gold font-bold mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-4 text-sm text-butter/80 font-medium">
              <li><button onClick={() => setView('home')} className="hover:text-brand-gold transition-colors flex items-center gap-2 group"><Zap size={10} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" /> Home</button></li>
              <li><button onClick={() => setView('reels')} className="hover:text-brand-gold transition-colors flex items-center gap-2 group"><Zap size={10} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" /> Shop Gallery</button></li>
              <li>
                <button 
                  onClick={() => {
                    setView('home');
                    setTimeout(() => {
                      const el = document.getElementById('about-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-brand-gold transition-colors flex items-center gap-2 group"
                >
                  <Zap size={10} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" /> The Brand
                </button>
              </li>
              <li><button onClick={() => setView('contact')} className="hover:text-brand-gold transition-colors flex items-center gap-2 group"><Zap size={10} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" /> Inquiry</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-brand-gold font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">Contact Us</h4>
            <ul className="space-y-4 text-[13px] text-butter/60">
              <li className="flex items-center gap-3 group cursor-pointer hover:text-brand-gold transition-colors">
                <Phone size={14} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="text-brand-gold" />
                <span>+234 908 225 9197</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer hover:text-brand-gold transition-colors">
                <Mail size={14} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="text-brand-gold" />
                <span>{EMAIL}</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer hover:text-brand-gold transition-colors">
                <MapPin size={14} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="text-brand-gold" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-brand-gold font-bold mb-6 uppercase tracking-[0.2em] text-[10px]">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/dah_dupsy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-brand-gold hover:text-brand-brown hover:-translate-y-1 transition-all duration-300"
              >
                <Instagram size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
              </a>
              <a 
                href="https://facebook.com/placeholder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-brand-gold hover:text-brand-brown hover:-translate-y-1 transition-all duration-300"
              >
                <Facebook size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-butter/10 pt-8 text-center text-xs text-butter/40">
          <p>&copy; {new Date().getFullYear()} DOMS COLLECTION. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
