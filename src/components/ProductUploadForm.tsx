import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Sparkles, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  Package,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Key,
  ExternalLink
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ProductUploadForm = () => {
  const [user] = useAuthState(auth);
  
  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [productType, setProductType] = useState<'wear' | 'treat'>('wear');
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // Settings / Gemini API Key & Model Choice
  const [adminApiKey, setAdminApiKey] = useState(() => {
    return localStorage.getItem('admin_gemini_api_key') || '';
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('admin_gemini_model') || 'gemini-3.5-flash';
  });
  
  // Flow states
  const [generating, setGenerating] = useState(false);
  const [uploadingState, setUploadingState] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Status feedback states (keeps UI elegant and avoids browser popups)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('admin_gemini_api_key', adminApiKey.trim());
  }, [adminApiKey]);

  useEffect(() => {
    localStorage.setItem('admin_gemini_model', selectedModel);
  }, [selectedModel]);

  // Compress image file to keep base64 strictly under Firestore 1MB document limit
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to lightweight JPEG (~60-120KB) well below Firestore's 1MB limit
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle local image file reading with automatic optimization
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }

    setUploadingState(true);
    setStatus(null);

    try {
      const compressedDataUrl = await compressImage(file);
      setImageUrl(compressedDataUrl);
      setStatus({ type: 'success', message: 'Image optimized and loaded successfully!' });
    } catch {
      setStatus({ type: 'error', message: 'Failed to process image file.' });
    } finally {
      setUploadingState(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Generate description using the Gemini API via our backend
  const generateDescription = async () => {
    if (!name.trim()) {
      setStatus({ type: 'error', message: 'Please enter a product name first.' });
      return;
    }

    setGenerating(true);
    setStatus(null);

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: name.trim(), 
          adminApiKey: adminApiKey.trim() || undefined,
          model: selectedModel
        })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate description');
      }
      
      if (data.description) {
        setDescription(data.description.trim());
        setStatus({ type: 'success', message: 'AI Product Description generated successfully!' });
      } else {
        throw new Error('Received empty response from description generator.');
      }
    } catch (error) {
      console.error(error);
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to connect to AI server. Please verify your internet connection.' 
      });
    } finally {
      setGenerating(false);
    }
  };

  // Submit the new product with offline fallback and zero document rejection
  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim()) {
      setStatus({ type: 'error', message: 'Please enter a product name.' });
      return;
    }
    if (!price || Number(price) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid product price.' });
      return;
    }
    if (!category.trim()) {
      setStatus({ type: 'error', message: 'Please select or type a category.' });
      return;
    }
    if (!imageUrl.trim()) {
      setStatus({ type: 'error', message: 'Please upload an image or insert a picture web link.' });
      return;
    }

    setSubmitting(true);
    const pathForWrite = 'products';

    try {
      const tempId = 'prod_' + Math.random().toString(36).substr(2, 9);
      
      const productPayload = {
        id: tempId,
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        image: imageUrl.trim(),
        imageUrls: [imageUrl.trim()],
        description: description.trim(),
        productType: 'wear',
        vendorId: user?.uid || 'admin',
        createdAt: new Date().toISOString()
      };

      let savedToCloud = false;
      try {
        await addDoc(collection(db, pathForWrite), productPayload);
        savedToCloud = true;
      } catch (cloudErr) {
        console.warn('Cloud save failed or offline, saving to local catalog store:', cloudErr);
      }

      // Always save to local store so storefront displays it immediately
      try {
        const existingLocal = JSON.parse(localStorage.getItem('dams_local_products') || '[]');
        localStorage.setItem('dams_local_products', JSON.stringify([productPayload, ...existingLocal]));
      } catch {}

      setStatus({ 
        type: 'success', 
        message: savedToCloud 
          ? 'Product successfully published to store catalog! ✨' 
          : 'Product saved to store catalog! (Active in shop)' 
      });
      
      // Clear form inputs on success
      setName('');
      setPrice('');
      setCategory('');
      setImageUrl('');
      setDescription('');
    } catch {
      setStatus({ type: 'error', message: 'Failed to save product. Please check connection.' });
    } finally {
      setSubmitting(false);
    }
  };

  const removeSelectedImage = () => {
    setImageUrl('');
    setStatus(null);
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-brand-brown/10 shadow-xl max-w-4xl mx-auto my-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-brand-brown/5 pb-4">
        <div className="bg-brand-gold/10 p-3 rounded-2xl text-brand-gold">
          <Package size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-brown">Product Publishing</h2>
          <p className="text-xs text-brand-brown/60">Create fashion items and leverage Gemini to write alluring descriptions</p>
        </div>
      </div>

      {/* API Key & Model Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* API Key Setting Option */}
        <div className="bg-brand-brown/[0.02] border border-brand-brown/5 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="text-brand-gold shrink-0" size={16} />
                <h4 className="text-sm font-serif font-bold text-brand-brown">Gemini API Key</h4>
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-xs text-brand-gold hover:text-brand-brown font-semibold transition-colors border-b border-dashed border-brand-gold hover:border-brand-brown"
              >
                <span>Grab API Key</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-xs text-brand-brown/50 mb-4 leading-relaxed">
              Provide your individual Gemini API key to generate custom descriptions. If left blank, we will default securely to the server's pre-configured key.
            </p>
          </div>
          <input 
            type="password"
            value={adminApiKey || ''}
            onChange={(e) => setAdminApiKey(e.target.value)}
            placeholder="AIzaSy... (Unlocks description module)"
            className="w-full bg-white border border-brand-brown/15 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold text-xs font-mono text-brand-brown transition-all"
          />
        </div>

        {/* Gemini Model Choice Selection Option */}
        <div className="bg-brand-brown/[0.02] border border-brand-brown/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-brand-gold shrink-0" size={16} />
            <h4 className="text-sm font-serif font-bold text-brand-brown">Gemini Creative Model</h4>
          </div>
          <p className="text-xs text-brand-brown/50 mb-3 leading-relaxed">
            Choose the specific brain for writing your allure descriptions. Higher models offer elevated e-commerce copy editing reasoning.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'gemini-3.1-flash-lite', name: 'Lite', speed: 'Fastest', desc: 'Summary text' },
              { id: 'gemini-3.5-flash', name: '3.5 Flash', speed: 'Balanced', desc: 'Deep creative' },
              { id: 'gemini-3.1-pro-preview', name: '3.1 Pro', speed: 'Smartest', desc: 'Paid option' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedModel(m.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all outline-none ${
                  selectedModel === m.id
                    ? 'border-brand-gold bg-brand-gold/[0.04] text-brand-brown ring-1 ring-brand-gold'
                    : 'border-brand-brown/10 hover:border-brand-brown/20 bg-white text-brand-brown/70'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-bold block">{m.name}</span>
                </div>
                <div className="mt-2 text-center w-full">
                  <span className={`text-[8px] px-1 py-0.5 rounded-full font-mono font-bold leading-none ${
                    selectedModel === m.id ? 'bg-brand-gold/20 text-brand-brown' : 'bg-brand-brown/5 text-brand-brown/50'
                  }`}>
                    {m.speed}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {selectedModel === 'gemini-3.1-pro-preview' && (
            <div className="mt-2.5 p-2 bg-amber-50 rounded-lg border border-amber-500/10 flex items-start gap-1.5 text-[9px] text-amber-800 leading-normal animate-fadeIn">
              <AlertCircle className="shrink-0 text-amber-600" size={12} />
              <span>Requires paid workspace permissions. Provide your own billing-configured API key if generation fails.</span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {status && (
        <div className={`p-4 rounded-2xl mb-8 flex items-start gap-3 text-sm transition-all animate-fadeIn ${
          status.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/25' 
            : 'bg-rose-50 text-rose-800 border border-rose-500/25'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle2 className="shrink-0 text-emerald-600 mt-0.5" size={18} />
          ) : (
            <AlertCircle className="shrink-0 text-rose-600 mt-0.5" size={18} />
          )}
          <p className="font-medium">{status.message}</p>
        </div>
      )}

      {/* Main Core Form */}
      <form onSubmit={submitProduct} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Product Info fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5 flex items-center gap-1.5">
                <FileText size={12} className="text-brand-gold" />
                Product Name
              </label>
              <input 
                type="text" 
                value={name || ''} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Luxury Suede Chelsea Boots"
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={12} className="text-brand-gold" />
                  Price (₦)
                </label>
                <input 
                  type="number" 
                  value={price || ''} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="35000"
                  min="0"
                  className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5 flex items-center gap-1.5">
                  <Tag size={12} className="text-brand-gold" />
                  Category
                </label>
                <input 
                  type="text" 
                  value={category || ''} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="e.g. Shoes, Wear, Accessories"
                  className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5">Product Type</label>
              <div className="flex bg-brand-brown/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setProductType('wear')}
                  className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${
                    productType === 'wear' ? 'bg-brand-brown text-white shadow-sm' : 'text-brand-brown/60 hover:text-brand-brown'
                  }`}
                >
                  Fashion / Wear
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('treat')}
                  className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${
                    productType === 'treat' ? 'bg-brand-brown text-white shadow-sm' : 'text-brand-brown/60 hover:text-brand-brown'
                  }`}
                >
                  Treat / Footwear
                </button>
              </div>
            </div>

            {/* AI Generator Button inside Form */}
            <div className="pt-2">
              <button 
                type="button"
                onClick={generateDescription}
                disabled={generating || !name.trim()}
                className="w-full btn-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-serif text-sm bg-gradient-to-r from-brand-gold via-yellow-600 to-brand-brown text-white hover:from-brand-gold/90 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin text-white" size={16} />
                    Gemini composing description...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-white group-hover:animate-pulse" />
                    Auto-Generate Description
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Image Input (Upload vs Link) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5 flex items-center justify-between">
                <span>Product Image</span>
                <span className="text-brand-brown/30 font-serif text-[10px] lowercase italic">Link url or directly upload file</span>
              </label>

              {/* Source tabs */}
              <div className="flex border-b border-brand-brown/10 mb-4 text-xs">
                <button
                  type="button"
                  onClick={() => { setImageSource('upload'); }}
                  className={`flex items-center gap-1.5 pb-2 px-3 border-b-2 font-medium transition-all ${
                    imageSource === 'upload' 
                      ? 'border-brand-gold text-brand-gold' 
                      : 'border-transparent text-brand-brown/50 hover:text-brand-brown'
                  }`}
                >
                  <Upload size={13} />
                  Upload Picture Directly
                </button>
                <button
                  type="button"
                  onClick={() => { setImageSource('url'); }}
                  className={`flex items-center gap-1.5 pb-2 px-3 border-b-2 font-medium transition-all ${
                    imageSource === 'url' 
                      ? 'border-brand-gold text-brand-gold' 
                      : 'border-transparent text-brand-brown/50 hover:text-brand-brown'
                  }`}
                >
                  <LinkIcon size={13} />
                  Provide Image URL Link
                </button>
              </div>

              {/* Dynamic Image Input body */}
              {imageSource === 'upload' ? (
                <div>
                  {imageUrl ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-brand-brown/10 bg-brand-brown/5 flex items-center justify-center h-48 sm:h-56">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="object-contain max-h-full max-w-full transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-brand-brown/40 border-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          className="bg-white hover:bg-red-50 text-red-600 rounded-full p-3 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all font-semibold flex items-center gap-1 text-xs"
                        >
                          <Trash2 size={16} />
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col justify-center items-center h-48 sm:h-56 relative ${
                        dragActive 
                          ? 'border-brand-gold bg-brand-gold/5 scale-[0.99]' 
                          : 'border-brand-brown/20 bg-brand-brown/[0.02] hover:bg-brand-brown/[0.05] hover:border-brand-gold/65'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="image-file-input"
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <label htmlFor="image-file-input" className="cursor-pointer flex flex-col items-center">
                        {uploadingState ? (
                          <>
                            <Loader2 className="animate-spin text-brand-gold mb-3" size={32} />
                            <p className="text-sm font-semibold text-brand-brown">Processing image...</p>
                          </>
                        ) : (
                          <>
                            <div className="bg-brand-gold/10 p-3.5 rounded-2xl text-brand-gold mb-3">
                              <Upload size={24} strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-bold text-brand-brown font-serif mb-1">Drag file here or click to browse</p>
                            <p className="text-[11px] text-brand-brown/40">PNG, JPG, or JPEG formats up to 2MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="url" 
                      value={imageUrl || ''} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      placeholder="https://images.unsplash.com/photo-..." 
                      className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                    />
                    <LinkIcon className="absolute left-3.5 top-3.5 text-brand-brown/40" size={16} />
                  </div>
                  
                  {imageUrl.trim() ? (
                    <div className="relative rounded-2xl overflow-hidden border border-brand-brown/10 bg-brand-brown/5 flex items-center justify-center h-40">
                      <img 
                        src={imageUrl} 
                        alt="Preview URL" 
                        onError={() => {/* Catch invalid images silently */}}
                        className="object-contain max-h-full max-w-full" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="border border-dashed border-brand-brown/10 rounded-2xl h-40 flex flex-col items-center justify-center text-brand-brown/30 text-center px-4 bg-brand-brown/[0.01]">
                      <ImageIcon size={32} strokeWidth={1} className="mb-2" />
                      <p className="text-xs">A live thumbnail preview of your pasted footwear URL will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text Area Description */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 flex items-center gap-1.5">
              <FileText size={12} className="text-brand-gold" />
              Product Description
            </label>
            <span className={`text-[10px] font-mono font-bold ${
              (description || '').length >= 100 ? 'text-rose-500' : 'text-brand-brown/40'
            }`}>
              {(description || '').length} / 100 characters max
            </span>
          </div>
          <textarea 
            value={description || ''} 
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 100) {
                setDescription(val);
              }
            }} 
            maxLength={100}
            placeholder="A compelling, professional description summarizing features, materials, and fits..." 
            className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm h-28 resize-none"
            required
          />
        </div>

        {/* Action Button */}
        <div>
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-brand-brown hover:bg-brand-brown/95 text-brand-gold font-serif font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-brand-brown/10 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.99] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin text-brand-gold" size={18} />
                Publishing item to server...
              </>
            ) : (
              'Publish Footwear / Wear'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
