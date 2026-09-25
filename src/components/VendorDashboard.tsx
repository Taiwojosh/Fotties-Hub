import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, signOut } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Hardcoded credentials
const ADMIN_ACCOUNTS = [
  { email: 'taiwojoshua423@gmail.com', password: 'password123' },
  { email: 'business@example.com', password: 'password123' },
];

export const VendorDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loadingDb, setLoadingDb] = useState(false);

  const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side authentication check
    const account = ADMIN_ACCOUNTS.find(a => a.email === email && a.password === password);
    
    if (account) {
      alert('Logged in as Vendor');
      // In a real app, you would set a user state here. 
      // For this prototype, I'll just alert.
    } else {
      alert('Invalid credentials');
    }
  };

  const updateApiKey = async () => {
    if (!user) return;
    setLoadingDb(true);
    try {
      await setDoc(doc(db, 'vendors', user.uid), {
        uid: user.uid,
        shopName: user.displayName || 'My Shop',
        email: user.email,
        geminiApiKey: apiKey
      }, { merge: true });
      alert('API Key updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update API Key');
    } finally {
      setLoadingDb(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Vendor Login</h2>
      <button onClick={signInWithGoogle} className="btn-primary mb-4 block">Login with Google</button>
      <form onSubmit={handleAuth} className="border p-4 rounded">
        <input type="email" value={email || ''} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2 w-full mb-2" required />
        <input type="password" value={password || ''} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2 w-full mb-2" required />
        <button type="submit" className="btn-primary">Sign In</button>
      </form>
    </div>
  );

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Vendor Dashboard</h2>
      <p>Welcome, {user.email || user.displayName}</p>
      <button onClick={() => signOut(auth)} className="text-sm text-red-500 mb-4">Log out</button>
      <div className="mt-4">
        <label className="block mb-2">Gemini API Key</label>
        <input 
          type="password" 
          value={apiKey || ''} 
          onChange={(e) => setApiKey(e.target.value)} 
          className="border p-2 w-full mb-4"
          placeholder="Paste your Gemini API Key"
        />
        <button onClick={updateApiKey} className="btn-primary" disabled={loadingDb}>
          {loadingDb ? 'Updating...' : 'Update API Key'}
        </button>
      </div>
    </div>
  );
};
