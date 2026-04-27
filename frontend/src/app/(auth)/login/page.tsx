'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = res.data;
      
      Cookies.set('accessToken', accessToken, { expires: 1/96 }); 
      
      setAuth({ accessToken, refreshToken, user });
      router.push('/dashboard');
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError('Network Error: Cannot reach backend server. Check logs.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="w-[60%] hidden md:flex flex-col justify-center items-start bg-primary text-white p-20">
        <h1 className="font-display text-6xl mb-6">FinSight</h1>
        <div className="w-16 h-1 bg-accent mb-8"></div>
        <p className="text-3xl font-light mb-16 max-w-md leading-tight">
          Complete clarity over your finances.
        </p>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <div className="w-2 h-2 rounded-full bg-accent/50"></div>
          <div className="w-2 h-2 rounded-full bg-accent/50"></div>
        </div>
      </div>

      <div className="w-full md:w-[40%] flex flex-col justify-center px-10 sm:px-20 bg-surface shadow-2xl relative z-10">
        <h2 className="font-sans text-3xl font-medium mb-8 text-gray-900">Welcome back</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              className={`border p-3 rounded-md transition-colors text-black focus:outline-none focus:border-primary ${error ? 'border-expense' : 'border-border'}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className={`border p-3 rounded-md transition-colors text-black focus:outline-none focus:border-primary ${error ? 'border-expense' : 'border-border'}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-expense text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-primary hover:bg-primary-hover text-white p-3 rounded-md font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-sm text-text-subtle text-center">
          Role-based access control enabled
        </p>
      </div>
    </div>
  );
}
