import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkle, Clock, ShieldCheck, Heart, Phone, Mail, MapPin, Loader2, ShoppingBasket, MessageSquare, Layout, Instagram, Facebook, Search, X, CheckCircle2, Play, Shirt, Flame } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';

// Lazy-loaded components
const ProductReels = React.lazy(() => import('./components/ProductReels').then(m => ({ default: m.ProductReels })));
const CartDrawer = React.lazy(() => import('./components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const Checkout = React.lazy(() => import('./components/Checkout').then(m => ({ default: m.Checkout })));
const OrderHistory = React.lazy(() => import('./components/OrderHistory').then(m => ({ default: m.OrderHistory })));
const WhatsAppButton = React.lazy(() => import('./components/WhatsAppButton').then(m => ({ default: m.WhatsAppButton })));
const PopularRank = React.lazy(() => import('./components/PopularRank').then(m => ({ default: m.PopularRank })));

import { Product, CartItem, View, Order } from './types';
import { useProducts } from './hooks/useProducts';
import { CATEGORIES, EMAIL, WHATSAPP_NUMBER } from './constants';

export default function App() {
  const { products, wears, bestSellers, categories, wearsCategories, loading: productsLoading } = useProducts();
  
  const [view, setView] = React.useState<View>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'reels';
    }
    return 'home';
  });
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [cart, setCart] = React.useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dupsy_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  
  // Initialize orders from localStorage
  const [orders, setOrders] = React.useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('dupsy_orders');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [category, setCategory] = React.useState('All');
  const [wearsCategory, setWearsCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [toast, setToast] = React.useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  React.useEffect(() => {
    try {
      localStorage.setItem('dupsy_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  React.useEffect(() => {
    try {
      localStorage.setItem('dupsy_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  // Scroll to top when view changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart! ✨`);
  };

  const handleReorder = (items: CartItem[]) => {
    setCart(prev => {
      let newCart = [...prev];
      items.forEach(reItem => {
        const existing = newCart.find(item => item.id === reItem.id);
        if (existing) {
          newCart = newCart.map(item => 
            item.id === reItem.id ? { ...item, quantity: item.quantity + reItem.quantity } : item
          );
        } else {
          newCart.push({ ...reItem });
        }
      });
      return newCart;
    });
    showToast(`${items.length} items added back to cart! 🛍️`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = (newOrder?: Order) => {
    setCart([]);
    if (newOrder) {
      setOrders(prev => [newOrder, ...prev]);
    }
    setView('home');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (productsLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-butter z-[1000]">
        <div className="flex flex-col items-center gap-6 text-brand-brown">
          <div className="relative">
            <Loader2 className="animate-spin text-brand-gold" size={48} strokeWidth={0.8} />
            <div className="absolute inset-0 animate-ping opacity-20 bg-brand-gold rounded-full" />
          </div>
          <p className="font-serif font-bold text-2xl tracking-tighter animate-pulse">Doms Collection</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = String(p.name || '').toLowerCase().includes(String(searchQuery || '').toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredWears = wears.filter(p => {
    const matchesCategory = wearsCategory === 'All' || p.category === wearsCategory;
    const matchesSearch = String(p.name || '').toLowerCase().includes(String(searchQuery || '').toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Header 
        currentView={view} 
        setView={setView} 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)}
      />

      <Suspense fallback={null}>
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart} 
          clearCart={clearCart} 
          setView={setView} 
        />
      </Suspense>

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section */}
              <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img 
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000&auto=format&fit=crop" 
                    alt="Doms Collection Hero" 
                    className="w-full h-full object-cover brightness-50"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-butter w-full">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl"
                  >
                    <span className="inline-block bg-brand-gold text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 shadow-sm">
                      Doms Collection Luxury
                    </span>
                    <h1 className="text-6xl md:text-[10rem] font-serif font-black mb-10 leading-[0.8] tracking-tighter">
                      Beyond <br />
                      <span className="text-brand-gold italic font-light opacity-90">Elegance</span>
                    </h1>
                    <p className="text-lg md:text-xl text-butter/80 mb-12 leading-relaxed max-w-lg font-light">
                      Discover the perfect blend of performance, style, and uncompromising comfort. Every step defines your journey. ✨
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button onClick={() => setView('reels')} className="btn-primary py-4 px-10 text-lg shadow-xl shadow-brand-brown/20 bg-brand-brown text-white">
                        Visit Shop
                      </button>
                      <button 
                        onClick={() => {
                          const el = document.getElementById('about-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }} 
                        className="btn-secondary py-4 px-10 text-lg border-butter text-butter hover:bg-butter hover:text-brand-brown"
                      >
                        Our Story
                      </button>
                    </div>
                  </motion.div>
                </div>
                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-butter to-transparent z-10" />
              </section>

              {/* Featured Categories */}
              <section className="py-24 bg-butter">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif font-bold text-brand-brown mb-4">What We Offer</h2>
                    <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { name: 'Leather Palm', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', desc: 'Crafted with premium choice leather.' },
                      { name: 'Sandals', img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', desc: 'Modern style meets daily comfort.' },
                      { name: 'Slides', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd0148de?q=80&w=800&auto=format&fit=crop', desc: 'Effortless style for every day.' },
                      { name: 'Corporate', img: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=800&auto=format&fit=crop', desc: 'Elegance for every professional occasion.' }
                    ].map((cat, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="group cursor-pointer"
                        onClick={() => {
                          setCategory(cat.name);
                          setView('reels');
                        }}
                      >
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 shadow-lg">
                          <img src={cat.img} alt={cat.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/80 to-transparent flex items-end p-8">
                            <h3 className="text-2xl font-serif font-bold text-butter">{cat.name}</h3>
                          </div>
                        </div>
                        <p className="text-brand-brown/60 text-sm px-2">{cat.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Featured Products */}
              <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <h2 className="text-4xl font-serif font-bold text-brand-brown mb-2">Bestsellers</h2>
                      <p className="text-brand-brown/60">Our most loved shoes this week.</p>
                    </div>
                    <button onClick={() => setView('best-sellers')} className="text-brand-brown font-bold flex items-center gap-2 hover:text-brand-gold transition-colors">
                      View All Bestsellers <ArrowRight size={20} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {bestSellers.slice(0, 4).map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                  </div>
                </div>
              </section>

              {/* About Section Combined into Home */}
              <section id="about-section" className="py-24 bg-butter/30">
                <div className="max-w-4xl mx-auto px-4">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-brand-brown mb-4">Our Story</h2>
                    <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full" />
                  </div>
                  <div className="glass-card rounded-3xl p-8 md:p-12 space-y-6 leading-relaxed text-brand-brown/80">
                    <p>
                      Doms Collection was founded on the principle that footwear is more than just an accessory—it's the foundation of your journey. We curate a premium collection of leather palms, sandals, and slides that blend timeless craftsmanship with modern innovation.
                    </p>
                    <p>
                      Our philosophy is simple: <strong>Style, Comfort, and Durability.</strong> We believe that every step you take should be supported by the highest quality materials and ergonomic design. Whether you're conquering the boardroom or the city streets, Doms Collection has the perfect fit for your lifestyle.
                    </p>
                    <p>
                      Beyond being a store, we are a footwear destination. We specialize in providing bespoke shoe-care advice to ensure your Doms Collection stays as extraordinary as the day you first stepped into it.
                    </p>
                    <div className="pt-8 border-t border-brand-brown/10 flex flex-col items-center gap-6">
                      <div className="text-center">
                        <p className="font-serif italic text-2xl text-brand-brown">Mafimisebi Oluwaseun</p>
                        <p className="text-xs uppercase tracking-widest text-brand-gold font-bold">Founder & Creative Director</p>
                      </div>
                      <div className="flex gap-4">
                        <a 
                          href="https://instagram.com/placeholder" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-brand-brown/5 rounded-full text-brand-brown hover:bg-brand-gold hover:text-white transition-all"
                        >
                          <Instagram size={20} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
                        </a>
                        <a 
                          href="https://facebook.com/placeholder" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-brand-brown/5 rounded-full text-brand-brown hover:bg-brand-gold hover:text-white transition-all"
                        >
                          <Facebook size={20} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* Remove unused menu and wears sections */}

          {view === 'reels' && (
            <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-butter z-[100]"><Loader2 className="animate-spin text-brand-gold" size={48} /></div>}>
              <ProductReels 
                products={[...products, ...wears]} 
                categories={CATEGORIES}
                onAddToCart={addToCart} 
                onClose={() => setView('home')} 
                setIsCartOpen={setIsCartOpen}
                cartCount={cartCount}
              />
            </Suspense>
          )}

          {view === 'best-sellers' && (
            <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-butter z-[100]"><Loader2 className="animate-spin text-brand-gold" size={48} /></div>}>
              <PopularRank 
                products={bestSellers} 
                onAddToCart={addToCart} 
                onOpenCart={() => setIsCartOpen(true)}
              />
            </Suspense>
          )}

          {/* Remove wears section */}

          {view === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <Suspense fallback={<div className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-brand-gold" size={32} /></div>}>
                <OrderHistory orders={orders} onReorder={handleReorder} onContinueShopping={() => setView('home')} />
              </Suspense>
            </motion.div>
          )}

          {view === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12"
            >
              <Suspense fallback={<div className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-brand-gold" size={32} /></div>}>
                <Checkout cartItems={cart} onSuccess={(order) => clearCart(order)} />
              </Suspense>
            </motion.div>
          )}

          {view === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-brand-brown mb-6">Get in Touch</h2>
                    <p className="text-brand-brown/60 mb-12 text-lg">
                      Have questions about our services or want to discuss a custom order? We'd love to hear from you!
                    </p>
                    
                    <div className="space-y-8">
                      {[
                        { icon: <Phone size={20} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />, label: "Call / WhatsApp", value: `+${WHATSAPP_NUMBER}` },
                        { icon: <Mail size={20} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />, label: "Email", value: EMAIL },
                        { icon: <MapPin size={20} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />, label: "Location", value: "Lagos, Nigeria" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-5 group cursor-pointer">
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-brand-brown/5 group-hover:bg-brand-brown group-hover:text-butter transition-all duration-300">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-brown/30 mb-1">{item.label}</p>
                            <p className="text-xl font-medium text-brand-brown group-hover:text-brand-gold transition-colors">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-3xl p-8 flex flex-col justify-center text-center space-y-6">
                    <div className="bg-brand-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={32} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="text-brand-gold" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-brand-brown">Send us a direct message</h3>
                    <p className="text-brand-brown/60">
                      We check our email regularly and will get back to you as soon as possible.
                    </p>
                    <a href={`mailto:${EMAIL}?subject=Inquiry from Doms Collection website`} className="btn-primary w-full md:w-auto inline-flex items-center justify-center">
                      <Mail size={18} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} className="mr-2" /> Send an Email
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <motion.div 
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden fixed bottom-0 left-0 right-0 h-20 z-[80] pointer-events-none"
      >
        <div className={`absolute bottom-0 left-0 right-0 h-16 transition-all duration-500 backdrop-blur-xl border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pointer-events-auto ${
          view === 'reels' 
            ? 'bg-black/60 border-white/10' 
            : 'bg-butter/95 border-brand-brown/5'
        }`} />
        
        <nav className="absolute bottom-0 left-0 right-0 h-16 px-4 flex justify-around items-center pointer-events-auto">
          {/* Active Indicator Pill */}
          <div className="absolute inset-0 flex justify-around items-center pointer-events-none px-4">
            {[
              { view: 'home' },
              { view: 'best-sellers' },
              { view: 'reels' },
              { view: 'orders' },
              { view: 'contact' }
            ].map((item, i) => (
              <div key={i} className="relative w-12 h-full flex justify-center items-center">
                {view === item.view && (
                  <motion.div
                    layoutId="nav-pill"
                    className={`absolute w-12 h-10 rounded-2xl transition-colors duration-500 ${
                      view === 'reels' ? 'bg-brand-gold/20' : 'bg-brand-gold/10'
                    }`}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </div>
            ))}
          </div>

          {[
            { icon: <Layout size={20} strokeWidth={1.2} />, label: 'Home', view: 'home' },
            { icon: <Flame size={20} strokeWidth={1.2} />, label: 'Popular', view: 'best-sellers' },
            { icon: <Play size={20} strokeWidth={1.2} />, label: 'Gallery', view: 'reels' },
            { icon: <ShoppingBasket size={20} strokeWidth={1.2} />, label: 'Orders', view: 'orders' },
            { icon: <MessageSquare size={20} strokeWidth={1.2} />, label: 'Contact', view: 'contact' }
          ].map((item, i) => {
            const isActive = view === item.view;
            const isReels = view === 'reels';
            return (
              <button
                key={i}
                onClick={() => setView(item.view as View)}
                className="relative flex flex-col items-center justify-center w-16 h-full z-10"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive 
                      ? '#C5A059' 
                      : (isReels ? '#FFFFFF66' : '#1A1A1A44')
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  className="flex items-center justify-center mb-0.5"
                >
                  {item.icon}
                </motion.div>
                {isActive && (
                  <motion.div 
                    layoutId="nav-dot"
                    className={`absolute -bottom-1 w-1 h-1 rounded-full bg-[#C5A059]`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Floating Cart Button (Mobile) */}
      <AnimatePresence>
        {view !== 'reels' && view !== 'best-sellers' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="md:hidden fixed bottom-44 right-6 z-[70] w-14 h-14 bg-brand-gold text-brand-brown rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <ShoppingBasket size={24} strokeWidth={1.2} fill="currentColor" fillOpacity={0.1} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-brown text-butter text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-butter">
                {cartCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <Footer setView={setView} />
      {view !== 'reels' && view !== 'best-sellers' && (
        <Suspense fallback={null}>
          <WhatsAppButton />
        </Suspense>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 md:bottom-10 left-1/2 z-[100] bg-brand-brown text-butter px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 whitespace-nowrap"
          >
            <div className="bg-brand-gold rounded-full p-1">
              <CheckCircle2 size={16} strokeWidth={1.2} fill="currentColor" fillOpacity={0.2} className="text-brand-brown" />
            </div>
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
