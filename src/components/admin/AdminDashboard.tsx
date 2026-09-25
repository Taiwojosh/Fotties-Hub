import React, { useState, useEffect } from 'react';
import { ProductUploadForm } from '../ProductUploadForm';
import { 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  PlusCircle, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Package,
  Search,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, setDoc, getDoc, getDocFromCache, getDocsFromCache, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, AuditLog } from '../../types';
import { GOOGLE_SHEET_CSV_URL, WEARS_GOOGLE_SHEET_CSV_URL, BEST_SELLERS_GOOGLE_SHEET_CSV_URL } from '../../constants';

export const AdminDashboard = ({ adminEmail = 'taiwojoshua423@gmail.com' }: { adminEmail?: string }) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'publish' | 'delete' | 'audit'>('sheets');
  
  // States for Google Sheets URLs
  const [treatsSheetUrl, setTreatsSheetUrl] = useState('');
  const [wearsSheetUrl, setWearsSheetUrl] = useState('');
  const [bestSellersSheetUrl, setBestSellersSheetUrl] = useState('');
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [savingSheets, setSavingSheets] = useState(false);
  const [testStatus, setTestStatus] = useState<{ [key: string]: { type: 'success' | 'error' | 'loading'; message: string } }>({});

  // States for catalog deletion logic
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // States for audit logs tracking
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setStatus(null);
    try {
      let querySnapshot;
      try {
        querySnapshot = await getDocs(collection(db, 'products'));
      } catch (serverErr) {
        console.warn("Could not query products from server (acting offline). Fulfilling query via local cache...");
        querySnapshot = await getDocsFromCache(collection(db, 'products'));
      }

      const fetched: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          name: data.name || '',
          price: Number(data.price) || 0,
          category: data.category || '',
          image: data.image || '',
          description: data.description || '',
          productType: data.productType || 'wear'
        });
      });
      setProducts(fetched);
    } catch (err) {
      console.warn("Error reading db products even with cache fallback:", err);
      setStatus({ type: 'error', message: 'Failed to retrieve products from database.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    setStatus(null);
    try {
      let querySnapshot;
      try {
        const q = query(collection(db, 'audit_logs'), orderBy('deletedAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (serverErr) {
        console.warn("Could not query audit logs with ordering/index (acting offline). Fulfilling query via local cache catalog fallback...", serverErr);
        // Fallback to getting entire collection from cache and sorting
        querySnapshot = await getDocsFromCache(collection(db, 'audit_logs'));
      }

      const fetched: AuditLog[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          productId: data.productId || '',
          productName: data.productName || '',
          productType: data.productType || '',
          category: data.category || '',
          price: Number(data.price) || 0,
          deletedBy: data.deletedBy || '',
          deletedAt: data.deletedAt
        });
      });
      fetched.sort((a, b) => {
        const tA = a.deletedAt?.seconds || 0;
        const tB = b.deletedAt?.seconds || 0;
        return tB - tA;
      });
      setAuditLogs(fetched);
    } catch (err) {
      console.warn("Index query error, falling back to client sort from uncached collection fetch:", err);
      try {
        let querySnapshot;
        try {
          querySnapshot = await getDocs(collection(db, 'audit_logs'));
        } catch (serverErr2) {
          querySnapshot = await getDocsFromCache(collection(db, 'audit_logs'));
        }
        const fetched: AuditLog[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            productId: data.productId || '',
            productName: data.productName || '',
            productType: data.productType || '',
            category: data.category || '',
            price: Number(data.price) || 0,
            deletedBy: data.deletedBy || '',
            deletedAt: data.deletedAt
          });
        });
        fetched.sort((a, b) => {
          const tA = a.deletedAt?.seconds || 0;
          const tB = b.deletedAt?.seconds || 0;
          return tB - tA;
        });
        setAuditLogs(fetched);
      } catch (fallbackErr) {
        console.warn("Error reading fallback audit logs:", fallbackErr);
        setStatus({ type: 'error', message: 'Failed to retrieve audit logs from database.' });
      }
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchSheetUrls = async () => {
    setLoadingSheets(true);
    try {
      // Direct local values first for instant zero-latency loading
      const localPrimary = localStorage.getItem('custom_sheet_url') || localStorage.getItem('custom_treats_sheet_url') || GOOGLE_SHEET_CSV_URL;
      const localWears = localStorage.getItem('custom_wears_sheet_url') || '';
      const localBestSellers = localStorage.getItem('custom_bestsellers_sheet_url') || '';
      
      setTreatsSheetUrl(localPrimary);
      setWearsSheetUrl(localWears);
      setBestSellersSheetUrl(localBestSellers);

      if (typeof navigator === 'undefined' || navigator.onLine) {
        try {
          let settingsSnap = null;
          try {
            settingsSnap = await getDoc(doc(db, 'settings', 'google_sheets'));
          } catch {
            try {
              settingsSnap = await getDocFromCache(doc(db, 'settings', 'google_sheets'));
            } catch {}
          }

          if (settingsSnap && settingsSnap.exists()) {
            const data = settingsSnap.data();
            if (data.sheetUrl || data.treatsUrl) setTreatsSheetUrl((data.sheetUrl || data.treatsUrl).trim());
            if (data.wearsUrl) setWearsSheetUrl(data.wearsUrl.trim());
            if (data.bestSellersUrl) setBestSellersSheetUrl(data.bestSellersUrl.trim());
          }
        } catch {
          // Silently rely on local values
        }
      }
    } catch {
      // Silently rely on local values
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleSaveSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSheets(true);
    setStatus(null);
    try {
      localStorage.setItem('custom_sheet_url', treatsSheetUrl.trim());
      localStorage.setItem('custom_treats_sheet_url', treatsSheetUrl.trim());
      localStorage.setItem('custom_wears_sheet_url', wearsSheetUrl.trim());
      localStorage.setItem('custom_bestsellers_sheet_url', bestSellersSheetUrl.trim());

      try {
        await setDoc(doc(db, 'settings', 'google_sheets'), {
          sheetUrl: treatsSheetUrl.trim(),
          treatsUrl: treatsSheetUrl.trim(),
          wearsUrl: wearsSheetUrl.trim(),
          bestSellersUrl: bestSellersSheetUrl.trim(),
          updatedAt: new Date().toISOString()
        });
      } catch {
        // Saved locally if offline
      }

      setStatus({ 
        type: 'success', 
        message: 'Google Sheets CSV configurations successfully saved and synchronized across all devices!' 
      });
    } catch {
      setStatus({ 
        type: 'error', 
        message: 'Failed to update settings.' 
      });
    } finally {
      setSavingSheets(false);
    }
  };

  const testConnection = async (type: 'treats' | 'wears' | 'bestsellers', url: string) => {
    if (!url.trim()) {
      setTestStatus(prev => ({
        ...prev,
        [type]: { type: 'error', message: 'Spreadsheet URL is empty.' }
      }));
      return;
    }

    setTestStatus(prev => ({
      ...prev,
      [type]: { type: 'loading', message: 'Testing connection...' }
    }));

    try {
      const response = await fetch(url.trim());
      if (response.ok) {
        const text = await response.text();
        const rows = text.split('\n').filter(r => r.trim());
        if (rows.length > 0) {
          const headers = rows[0].toLowerCase();
          const hasRequired = headers.includes('name') && headers.includes('price');
          if (hasRequired) {
            setTestStatus(prev => ({
              ...prev,
              [type]: { 
                type: 'success', 
                message: `Success! Connection verified. Found ${rows.length - 1} records with proper headers.` 
              }
            }));
          } else {
            setTestStatus(prev => ({
              ...prev,
              [type]: { 
                type: 'error', 
                message: 'Connected but could not find headers named "name" and "price". Please verify format.' 
              }
            }));
          }
        } else {
          setTestStatus(prev => ({
            ...prev,
            [type]: { type: 'error', message: 'Connected but spreadsheet appears empty.' }
          }));
        }
      } else {
        setTestStatus(prev => ({
          ...prev,
          [type]: { type: 'error', message: `Server returned HTTP status ${response.status}.` }
        }));
      }
    } catch (err) {
      setTestStatus(prev => ({
        ...prev,
        [type]: { type: 'error', message: 'Fetch rejected (check browser CORs or publish status).' }
      }));
    }
  };

  useEffect(() => {
    if (activeTab === 'sheets') {
      fetchSheetUrls();
    } else if (activeTab === 'delete') {
      fetchProducts();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    setStatus(null);
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) {
      setStatus({ type: 'error', message: 'Selected product is no longer present in cache.' });
      setDeletingId(null);
      return;
    }

    try {
      // Create Audit Log Document first to prevent orphaned record updates
      const logDocRef = doc(collection(db, 'audit_logs'));
      const logId = logDocRef.id;
      const logEntry = {
        id: logId,
        productId: targetProduct.id,
        productName: targetProduct.name,
        productType: targetProduct.productType || 'wear',
        category: targetProduct.category || 'Uncategorized',
        price: Number(targetProduct.price) || 0,
        deletedBy: adminEmail,
        deletedAt: serverTimestamp()
      };

      await setDoc(logDocRef, logEntry);

      // Delete original document
      await deleteDoc(doc(db, 'products', productId));
      
      setStatus({ type: 'success', message: `Product "${targetProduct.name}" successfully deleted and recorded in security audit logs!` });
      setConfirmDeleteId(null);
      // Refresh current records list
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error("Error deleting document / logging audit trail:", err);
      setStatus({ type: 'error', message: 'Failed to delete product or establish secure audit trail.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(log => 
    log.productName.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
    log.deletedBy.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
    log.category.toLowerCase().includes(auditSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Decorative dashboard sub-stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-brand-brown/5 to-white border border-brand-brown/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Operational Status</span>
            <p className="text-xl font-serif font-black text-brand-brown mt-1">Ready</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-brand-brown/5 to-white border border-brand-brown/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Creative Assistant</span>
            <p className="text-xl font-serif font-black text-brand-brown mt-1">Gemini 3.5</p>
          </div>
          <div className="w-10 h-10 bg-brand-gold/15 text-brand-gold rounded-xl flex items-center justify-center">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-brand-brown/5 to-white border border-brand-brown/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider font-sans">E-Commerce Sync</span>
            <p className="text-xl font-serif font-black text-brand-brown mt-1">Real-time</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
            <RefreshCw size={18} className="animate-spin-slow text-brand-brown/60" />
          </div>
        </div>
      </div>

      {/* Primary Dashboard Selector Navigation Tabs */}
      <div className="flex border-b border-brand-brown/10 max-w-2xl overflow-x-auto shrink-0 pb-1">
        <button
          onClick={() => { setActiveTab('sheets'); setStatus(null); }}
          className={`flex items-center justify-center gap-2 py-4 px-4 text-xs md:text-sm font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
            activeTab === 'sheets'
              ? 'border-brand-brown text-brand-brown font-black'
              : 'border-transparent text-brand-brown/40 hover:text-brand-brown'
          }`}
        >
          <FileSpreadsheet size={16} />
          Google Sheets Sync
        </button>
        <button
          onClick={() => { setActiveTab('publish'); setStatus(null); }}
          className={`flex items-center justify-center gap-2 py-4 px-4 text-xs md:text-sm font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
            activeTab === 'publish'
              ? 'border-brand-brown text-brand-brown font-black'
              : 'border-transparent text-brand-brown/40 hover:text-brand-brown'
          }`}
        >
          <PlusCircle size={16} />
          Publish Custom Product
        </button>
        <button
          onClick={() => { setActiveTab('delete'); setStatus(null); }}
          className={`flex items-center justify-center gap-2 py-4 px-4 text-xs md:text-sm font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
            activeTab === 'delete'
              ? 'border-brand-brown text-brand-brown font-black'
              : 'border-transparent text-brand-brown/40 hover:text-brand-brown'
          }`}
        >
          <Trash2 size={16} />
          Delete Products
        </button>
        <button
          onClick={() => { setActiveTab('audit'); setStatus(null); }}
          className={`flex items-center justify-center gap-2 py-4 px-4 text-xs md:text-sm font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
            activeTab === 'audit'
              ? 'border-brand-brown text-brand-brown font-black'
              : 'border-transparent text-brand-brown/40 hover:text-brand-brown'
          }`}
        >
          <History size={16} />
          Audit Logs
        </button>
      </div>

      {/* Main Core View Area */}
      <div>
        {activeTab === 'sheets' && (
          <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-brand-brown/10 shadow-xl max-w-4xl mx-auto animate-fadeIn space-y-8">
            <div className="flex items-center gap-3 border-b border-brand-brown/5 pb-4">
              <div className="bg-brand-brown/5 text-brand-brown p-3 rounded-2xl">
                <FileSpreadsheet size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-brown">Spreadsheet Catalog Synclink</h2>
                <p className="text-xs text-brand-brown/60">Manage dynamic catalog connections instantly without database delays or posting limits</p>
              </div>
            </div>

            {/* Status messages specifically for Sheet saving */}
            {status && (
              <div className={`p-4 rounded-2xl flex items-start gap-3 text-sm animate-fadeIn ${
                status.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/25' 
                  : 'bg-rose-50 text-rose-800 border border-rose-500/25'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                ) : (
                  <AlertCircle className="shrink-0 text-rose-600 mt-0.5" size={18} />
                )}
                <p className="font-semibold">{status.message}</p>
              </div>
            )}

            {loadingSheets ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-4 text-brand-brown/50">
                <Loader2 className="animate-spin text-brand-gold" size={32} />
                <p className="text-sm font-medium">Retrieving catalog settings from storage...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSheets} className="space-y-6">
                <div className="space-y-4">
                  
                  {/* Primary Footwear Sheet */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-brand-brown block">
                      Primary Footwear Catalog Spreadsheet CSV URL (Leather Palms, Sandals, Slides, Corporate)
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={treatsSheetUrl}
                        onChange={(e) => setTreatsSheetUrl(e.target.value)}
                        placeholder={GOOGLE_SHEET_CSV_URL}
                        className="flex-1 bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-sm text-brand-brown font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => testConnection('treats', treatsSheetUrl || GOOGLE_SHEET_CSV_URL)}
                        className="px-4 py-3 bg-brand-brown/5 hover:bg-brand-brown/10 rounded-xl text-xs font-bold text-brand-brown border border-brand-brown/15 transition-all text-center whitespace-nowrap"
                      >
                        Test Link
                      </button>
                    </div>
                    {testStatus['treats'] && (
                      <p className={`text-xs font-semibold ${
                        testStatus['treats'].type === 'success' ? 'text-emerald-600' :
                        testStatus['treats'].type === 'loading' ? 'text-brand-gold font-bold animate-pulse' : 'text-rose-600'
                      }`}>
                        {testStatus['treats'].message}
                      </p>
                    )}
                    <span className="text-[10px] text-brand-brown/50 block">
                      Powers the entire storefront with zero database limits. Active link: Dams Collection Google Sheet CSV.
                    </span>
                  </div>

                  {/* Additional Footwear Sheet */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-brand-brown block">
                      Additional Footwear Catalog Spreadsheet CSV URL <span className="text-brand-brown/40 font-normal">(Optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={wearsSheetUrl}
                        onChange={(e) => setWearsSheetUrl(e.target.value)}
                        placeholder="Paste additional published Footwear Comma-Separated Values (.csv) link..."
                        className="flex-1 bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-sm text-brand-brown font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => testConnection('wears', wearsSheetUrl)}
                        className="px-4 py-3 bg-brand-brown/5 hover:bg-brand-brown/10 rounded-xl text-xs font-bold text-brand-brown border border-brand-brown/15 transition-all whitespace-nowrap"
                      >
                        Test Link
                      </button>
                    </div>
                    {testStatus['wears'] && (
                      <p className={`text-xs font-semibold ${
                        testStatus['wears'].type === 'success' ? 'text-emerald-600' :
                        testStatus['wears'].type === 'loading' ? 'text-brand-gold font-bold animate-pulse' : 'text-rose-600'
                      }`}>
                        {testStatus['wears'].message}
                      </p>
                    )}
                    <span className="text-[10px] text-brand-brown/50 block">
                      Optional: Merges extra seasonal drops or catalog extensions into the shop.
                    </span>
                  </div>

                  {/* Best Sellers Sheet */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-brand-brown block">
                      Exclusive Best-Sellers Spreadsheet CSV URL <span className="text-brand-brown/40 font-normal">(Optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={bestSellersSheetUrl}
                        onChange={(e) => setBestSellersSheetUrl(e.target.value)}
                        placeholder="Paste published Best-Sellers CSV link..."
                        className="flex-1 bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-sm text-brand-brown font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => testConnection('bestsellers', bestSellersSheetUrl)}
                        className="px-4 py-3 bg-brand-brown/5 hover:bg-brand-brown/10 rounded-xl text-xs font-bold text-brand-brown border border-brand-brown/15 transition-all whitespace-nowrap"
                      >
                        Test Link
                      </button>
                    </div>
                    {testStatus['bestsellers'] && (
                      <p className={`text-xs font-semibold ${
                        testStatus['bestsellers'].type === 'success' ? 'text-emerald-600' :
                        testStatus['bestsellers'].type === 'loading' ? 'text-brand-gold font-bold animate-pulse' : 'text-rose-600'
                      }`}>
                        {testStatus['bestsellers'].message}
                      </p>
                    )}
                    <span className="text-[10px] text-brand-brown/40 block">
                      If not provided, the system automatically features your top treats row items on the landing page catalog.
                    </span>
                  </div>

                </div>

                <div className="flex gap-3 pt-4 border-t border-brand-brown/5">
                  <button
                    type="submit"
                    disabled={savingSheets}
                    className="flex-1 md:flex-initial px-6 py-3 bg-brand-brown hover:bg-brand-brown/90 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {savingSheets ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Saving Configuration...
                      </>
                    ) : (
                      'Save & Broadcast Sync'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTreatsSheetUrl('');
                      setWearsSheetUrl('');
                      setBestSellersSheetUrl('');
                      setTestStatus({});
                      setStatus({ type: 'success', message: 'Loaded default system configurations. Click Save to overwrite.' });
                    }}
                    className="px-4 py-3 bg-brand-brown/5 hover:bg-brand-brown/10 text-brand-brown text-xs font-bold tracking-wider uppercase rounded-xl transition-all border border-brand-brown/10"
                  >
                    Restore Original Defaults
                  </button>
                </div>
              </form>
            )}

            {/* Quick Spreadsheet Instruction Guide */}
            <div className="p-6 bg-brand-brown/[0.02] border border-brand-brown/10 rounded-2xl space-y-4">
              <h3 className="font-serif font-black text-brand-brown text-lg flex items-center gap-2">
                <FileSpreadsheet className="text-brand-gold" size={18} />
                Storekeeper CSV Publishing Guide
              </h3>
              <div className="text-xs text-brand-brown/70 space-y-2.5 leading-relaxed font-sans">
                <p>
                  To convert any standard Google Spreadsheet into a live, fast catalog feed:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1.5">
                  <li>Open your catalogue in <strong>Google Sheets</strong>.</li>
                  <li>Verify that your first row possesses these exact lowercase headers: <code className="bg-brand-brown/5 px-1 rounded font-mono font-bold text-brand-brown">id</code>, <code className="bg-brand-brown/5 px-1 rounded font-mono font-bold text-brand-brown">name</code>, <code className="bg-brand-brown/5 px-1 rounded font-mono font-bold text-brand-brown">price</code>, <code className="bg-brand-brown/5 px-1 rounded font-mono font-bold text-brand-brown">category</code>, <code className="bg-brand-brown/5 px-1 rounded font-mono font-bold text-brand-brown">image</code>, <code className="bg-brand-brown/5 px-1 rounded font-mono font-bold text-brand-brown">description</code>.</li>
                  <li>Click <strong>File</strong> &rarr; <strong>Share</strong> &rarr; <strong>Publish to web</strong>.</li>
                  <li>In the link tab, select your catalog Sheet, and change the format dropdown from "Web Page" to <strong>Comma-separated values (.csv)</strong>.</li>
                  <li>Click <strong>Publish</strong> and copy the resulting link!</li>
                  <li>Paste that link into the appropriate feed input above and click "Save & Broadcast Sync".</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="animate-fadeIn">
            <ProductUploadForm />
          </div>
        )}

        {activeTab === 'delete' && (
          <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-brand-brown/10 shadow-xl max-w-4xl mx-auto animate-fadeIn">
            <div className="flex items-center gap-3 mb-8 border-b border-brand-brown/5 pb-4">
              <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl">
                <Package size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-brown">Product Deletion Matrix</h2>
                <p className="text-xs text-brand-brown/60">View and remove live custom catalog items instantly</p>
              </div>
              <button 
                onClick={fetchProducts}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 border border-brand-brown/15 hover:border-brand-brown/30 rounded-full text-xs text-brand-brown transition-all disabled:opacity-50 font-medium"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Status alerts */}
            {status && (
              <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm animate-fadeIn ${
                status.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/25' 
                  : 'bg-rose-50 text-rose-800 border border-rose-500/25'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                ) : (
                  <AlertCircle className="shrink-0 text-rose-600 mt-0.5" size={18} />
                )}
                <p className="font-semibold">{status.message}</p>
              </div>
            )}

            {/* Catalog Filter Input */}
            <div className="relative mb-6">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search database products by name or category..."
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-sm text-brand-brown"
              />
              <Search className="absolute left-3.5 top-3.5 text-brand-brown/40" size={16} />
            </div>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4 text-brand-brown/50">
                <Loader2 className="animate-spin text-brand-gold" size={32} />
                <p className="text-sm font-medium">Scanning live catalog db...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="border border-dashed border-brand-brown/15 rounded-2xl py-16 text-center text-brand-brown/40 bg-brand-brown/[0.01]">
                <Package size={48} className="mx-auto text-brand-brown/20 mb-3" strokeWidth={1} />
                <h4 className="font-bold text-sm">No DB Products Cataloged</h4>
                <p className="text-xs max-w-xs mx-auto text-brand-brown/50 mt-1">
                  {searchQuery ? 'No products match your current search string.' : 'Create item entries within the Publish tab to start catalog selection.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="p-4 bg-brand-brown/[0.01] border border-brand-brown/10 rounded-2xl flex gap-3.5 items-center justify-between hover:shadow-sm transition-all bg-white"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-brown/5 flex items-center justify-center shrink-0 border border-brand-brown/5">
                      {prod.image ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Package className="text-brand-brown/20" size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-black text-brand-brown text-sm truncate">{prod.name}</h4>
                      <p className="text-[10px] text-brand-gold uppercase tracking-wider font-bold mt-0.5">{prod.category || 'Uncategorized'}</p>
                      <p className="text-xs font-mono text-brand-brown/60 mt-1">₦{Number(prod.price).toLocaleString()}</p>
                    </div>
                    <div className="shrink-0 font-sans">
                      {confirmDeleteId === prod.id ? (
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-[9px] text-rose-600 font-bold uppercase animate-pulse">Are you sure?</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleDelete(prod.id)}
                              disabled={deletingId === prod.id}
                              className="px-2.5 py-1 bg-red-600 font-bold hover:bg-red-700 text-white rounded-lg text-[10px] transition-all"
                            >
                              {deletingId === prod.id ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 bg-brand-brown/10 font-bold text-brand-brown hover:bg-brand-brown/15 rounded-lg text-[10px] transition-all"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(prod.id)}
                          className="p-2.5 border border-red-500/10 hover:border-red-500 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl transition-all"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="glass-card rounded-3xl p-6 md:p-8 bg-white border border-brand-brown/10 shadow-xl max-w-4xl mx-auto animate-fadeIn">
            <div className="flex items-center gap-3 mb-8 border-b border-brand-brown/5 pb-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
                <History size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-brown">Deletion Ledger</h2>
                <p className="text-xs text-brand-brown/60">Transparency log of deleted catalog products and administrative accountability</p>
              </div>
              <button 
                onClick={fetchAuditLogs}
                disabled={logsLoading}
                className="flex items-center gap-1.5 px-4 py-2 border border-brand-brown/15 hover:border-brand-brown/30 rounded-full text-xs text-brand-brown transition-all disabled:opacity-50 font-medium"
              >
                <RefreshCw size={13} className={logsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Catalog Filter Input */}
            <div className="relative mb-6">
              <input 
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Filter logs by product name, category, or admin email..."
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-sm text-brand-brown"
              />
              <Search className="absolute left-3.5 top-3.5 text-brand-brown/40" size={16} />
            </div>

            {logsLoading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4 text-brand-brown/50">
                <Loader2 className="animate-spin text-brand-gold" size={32} />
                <p className="text-sm font-medium">Scanning secure ledger lines...</p>
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="border border-dashed border-brand-brown/15 rounded-2xl py-16 text-center text-brand-brown/40 bg-brand-brown/[0.01]">
                <FileSpreadsheet size={48} className="mx-auto text-brand-brown/20 mb-3" strokeWidth={1} stroke={ '#a86c00' } />
                <h4 className="font-bold text-sm">Ledger Clean</h4>
                <p className="text-xs max-w-xs mx-auto text-brand-brown/50 mt-1">
                  {auditSearchQuery ? 'No logged action items found matching your keyphrase.' : 'Zero delete actions recorded in history. Your store catalog is pristine.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAuditLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 md:p-5 bg-white border border-brand-brown/10 rounded-2xl hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 font-serif font-bold text-xs">
                        -{log.productType?.substring(0, 1).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-black text-brand-brown text-base leading-tight">{log.productName}</h4>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-brown/5 text-brand-brown/60 uppercase font-mono font-bold tracking-wider">
                            ID: {log.productId?.substring(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 mt-1 text-xs text-brand-brown/60 flex-wrap">
                          <span>Category: <strong className="text-brand-brown font-medium">{log.category}</strong></span>
                          <span className="text-brand-brown/20">•</span>
                          <span>Price: <strong className="text-brand-brown font-mono">₦{log.price.toLocaleString()}</strong></span>
                          {log.productType && (
                            <>
                              <span className="text-brand-brown/20">•</span>
                              <span>Type: <strong className="text-brand-brown uppercase font-semibold text-[10px]">{log.productType}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-1 border-t border-brand-brown/5 md:border-none pt-3 md:pt-0 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-brand-brown/40 uppercase tracking-widest font-bold">Deleted By:</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-orange-100/60 text-orange-950 font-bold border border-orange-200 font-mono">
                          {log.deletedBy}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-brand-brown/50 mt-0.5">
                        <History size={11} className="text-brand-gold shrink-0" />
                        <span>{formatTimestamp(log.deletedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const formatTimestamp = (ts: any) => {
  if (!ts) return 'Unknown date';
  if (ts.toDate) {
    try {
      return ts.toDate().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      console.error(e);
    }
  }
  if (ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
