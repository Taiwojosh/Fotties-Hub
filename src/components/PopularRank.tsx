import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBasket, Plus, MessageSquare, Sparkle, Flame, Trophy } from 'lucide-react';
import { Product } from '../types';

interface PopularRankProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
}

export const PopularRank: React.FC<PopularRankProps> = ({ products, onAddToCart, onOpenCart }) => {
  return (
    <div className="min-h-screen bg-butter pt-12 pb-32">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16 px-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 bg-brand-gold text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-lg shadow-brand-gold/20"
          >
            <Trophy size={14} strokeWidth={2} />
            The Elite List
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-serif font-black text-brand-brown mb-6 leading-[0.8] tracking-tighter">
            Community <br />
            <span className="text-brand-gold italic font-light drop-shadow-sm">Favorites</span>
          </h1>
          <p className="text-brand-brown/40 italic font-light max-w-sm mx-auto">
            A curated selection of what defined the trends this season.
          </p>
        </div>

        <div className="space-y-8">
          {products.map((product, index) => {
            const rank = index + 1;
            const isZeroPrice = product.price === 0;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-[3rem] p-5 flex flex-col md:flex-row items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-brand-brown/5 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:border-brand-gold/30 transition-all duration-700"
              >
                {/* Rank Number */}
                <div className="absolute -top-6 -left-6 md:static md:w-20 flex items-center justify-center shrink-0">
                  <span className={`text-6xl md:text-8xl font-serif font-black italic select-none ${
                    rank === 1 ? 'text-brand-gold' : 'text-brand-brown/[0.03]'
                  }`}>
                    {rank.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Product Image */}
                <div className="w-full md:w-56 aspect-[4/5] rounded-[2.5rem] overflow-hidden shrink-0 relative shadow-2xl shadow-black/5">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  {rank === 1 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-brand-gold p-3 rounded-2xl shadow-xl border border-brand-gold/10">
                      <Sparkle size={20} fill="currentColor" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left py-4 px-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <span className="inline-block bg-brand-gold/5 text-brand-gold px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-brand-gold/10">
                      {product.category}
                    </span>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-red-500/80">
                      <Flame size={16} strokeWidth={2} className="animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hot Listing</span>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-serif font-black text-brand-brown mb-4 leading-[0.9] tracking-tighter group-hover:text-brand-gold transition-colors duration-500">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-brand-brown/40 line-clamp-2 leading-relaxed mb-8 max-w-md italic font-light">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-center md:justify-start">
                    <span className="text-3xl font-black text-brand-brown tracking-tighter">
                      {isZeroPrice ? 'Price Varies' : `₦${product.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto flex md:flex-col gap-3">
                  {isZeroPrice ? (
                    <a 
                      href={`https://wa.me/2349082259197?text=Hello Dams Collection, I am interested in inquiring about ${product.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:w-20 h-16 md:h-20 flex items-center justify-center bg-brand-brown text-brand-gold rounded-[1.5rem] hover:bg-black transition-all duration-500 shadow-xl shadow-black/10"
                    >
                      <MessageSquare size={24} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
                    </a>
                  ) : (
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="flex-1 md:w-20 h-16 md:h-20 flex items-center justify-center bg-brand-gold text-white rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all duration-500 shadow-xl shadow-brand-gold/20"
                    >
                      <Plus size={26} strokeWidth={2} />
                    </button>
                  )}
                  <button 
                    onClick={onOpenCart}
                    className="flex-1 md:w-20 h-16 md:h-20 flex items-center justify-center bg-brand-brown/5 text-brand-brown rounded-[1.5rem] hover:bg-brand-brown hover:text-white transition-all duration-500"
                  >
                    <ShoppingBasket size={22} strokeWidth={1.2} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="inline-block p-8 bg-white/50 rounded-[3rem] border border-dashed border-brand-brown/10">
            <p className="text-brand-brown/40 text-sm italic">
              Ranks are updated every 24 hours based on community interactions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
