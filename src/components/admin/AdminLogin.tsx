import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle, ArrowUpDown, LogOut } from 'lucide-react';

const DEFAULT_ACCOUNTS = [
  { email: 'taiwojoshua423@gmail.com', password: 'password123' },
  { email: 'damscollections01@gmail.com', password: 'password123' },
];

export const AdminLogin = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'change-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // States for password changing
  const [changeEmail, setChangeEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status feedback states (keeps UI elegant and avoids native alert popups)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  // Fetch accounts mapped with any locally saved custom passwords
  const getAdminAccounts = () => {
    try {
      const customPasswords = localStorage.getItem('admin_passwords');
      const passwordsMap = customPasswords ? JSON.parse(customPasswords) : {};
      return DEFAULT_ACCOUNTS.map(acc => ({
        ...acc,
        password: passwordsMap[acc.email.toLowerCase().trim()] || acc.password,
      }));
    } catch (e) {
      return DEFAULT_ACCOUNTS;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const checkEmail = email.trim().toLowerCase();
    const accounts = getAdminAccounts();
    const account = accounts.find(a => a.email.toLowerCase().trim() === checkEmail && a.password === password.trim());

    if (account) {
      setIsLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_email', account.email);
      setStatus({ type: 'success', message: 'Logged in successfully! Welcome back.' });
    } else {
      setStatus({ type: 'error', message: 'Invalid admin credentials. Please verify your email and password.' });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const checkEmail = changeEmail.trim().toLowerCase();
    const isValidAdminEmail = DEFAULT_ACCOUNTS.some(a => a.email.toLowerCase().trim() === checkEmail);

    if (!isValidAdminEmail) {
      setStatus({ type: 'error', message: 'Unauthorized email. Password can only be changed for verified admin accounts.' });
      return;
    }

    if (newPassword.trim().length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setStatus({ type: 'error', message: 'Passwords do not match. Please re-enter.' });
      return;
    }

    try {
      const customPasswords = localStorage.getItem('admin_passwords');
      const passwordsMap = customPasswords ? JSON.parse(customPasswords) : {};
      passwordsMap[checkEmail] = newPassword.trim();
      localStorage.setItem('admin_passwords', JSON.stringify(passwordsMap));
      
      setStatus({ type: 'success', message: 'Password changed successfully! You can now log in.' });
      setActiveTab('login');
      // Autofill email and password for easier login flow
      setEmail(changeEmail);
      setPassword(newPassword);
      setChangeEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred while saving the password.' });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_email');
    setStatus(null);
  };

  if (isLoggedIn) {
    const loggedInEmail = localStorage.getItem('admin_email') || 'taiwojoshua423@gmail.com';
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-brand-brown/10">
          <div>
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-brand-gold">Dams Collection</span>
            <h1 className="text-3xl md:text-5xl font-black text-brand-brown font-serif">Admin Portal</h1>
            <p className="text-xs text-brand-brown/50 mt-1">
              Signed in as: <span className="font-semibold text-brand-gold">{loggedInEmail}</span>
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-500/20 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
        <AdminDashboard adminEmail={loggedInEmail} />
      </div>
    );
  }

  return (
    <div className="px-4 py-16 md:py-24 max-w-lg mx-auto flex flex-col justify-center min-h-[70vh]">
      <div className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden bg-white/95">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-gold to-brand-brown" />
        
        <div className="text-center mb-8">
          <div className="bg-brand-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-brand-gold" size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-brown">Management Core</h2>
          <p className="text-sm text-brand-brown/60 mt-1">Access secure control & product creation modules</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-brand-brown/5 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab('login'); setStatus(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-white text-brand-brown shadow-sm'
                : 'text-brand-brown/60 hover:text-brand-brown'
            }`}
          >
            Admin Sign In
          </button>
          <button
            onClick={() => { setActiveTab('change-password'); setStatus(null); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'change-password'
                ? 'bg-white text-brand-brown shadow-sm'
                : 'text-brand-brown/60 hover:text-brand-brown'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Feedback Banners */}
        {status && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm ${
            status.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/25' 
              : 'bg-rose-50 text-rose-800 border border-rose-500/25'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="shrink-0 text-emerald-600 mt-0.5" size={18} />
            ) : (
              <AlertCircle className="shrink-0 text-rose-600 mt-0.5" size={18} />
            )}
            <p>{status.message}</p>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5">Authorized Email</label>
              <input 
                type="email" 
                value={email || ''} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="taiwojoshua423@gmail.com" 
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5">Access Password</label>
              <input 
                type="password" 
                value={password || ''} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                required 
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2">
              <KeyRound size={16} />
              Verify Credentials
            </button>
          </form>
        )}

        {/* Change Password Form */}
        {activeTab === 'change-password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5">Confirm Identity Email</label>
              <input 
                type="email" 
                value={changeEmail || ''} 
                onChange={e => setChangeEmail(e.target.value)} 
                placeholder="damscollections01@gmail.com" 
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5">New Password</label>
              <input 
                type="password" 
                value={newPassword || ''} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Minimum 6 characters" 
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-brand-brown/50 mb-1.5">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword || ''} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password" 
                className="w-full bg-brand-brown/5 border border-brand-brown/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white transition-all text-brand-brown text-sm" 
                required 
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white">
              <ArrowUpDown size={16} />
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
