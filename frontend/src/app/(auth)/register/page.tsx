'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', { firstName, lastName, email, password, role });
      if (role === 'VIEWER') {
        setSuccess('Account created successfully! Redirecting to login...');
      } else {
        setSuccess('Account created! Your account is pending admin approval. Redirecting to login...');
      }
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      if (err.message === 'Network Error') {
        setError('Network Error: Cannot reach backend server. Check logs.');
      } else if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        const firstError = err.response.data.errors[0];
        setError(`Validation error: ${firstError.field} - ${firstError.message}`);
      } else {
        setError(err.response?.data?.message || 'Failed to create account');
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
          Join to get clarity over your finances.
        </p>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <div className="w-2 h-2 rounded-full bg-accent/50"></div>
          <div className="w-2 h-2 rounded-full bg-accent/50"></div>
        </div>
      </div>

      <div className="w-full md:w-[40%] flex flex-col justify-center px-10 sm:px-20 bg-surface shadow-2xl relative z-10">
        <h2 className="font-sans text-3xl font-medium mb-8 text-gray-900">Sign Up</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" suppressHydrationWarning>
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input 
                type="text" 
                data-gramm="false"
                className={`border p-3 rounded-md transition-colors text-black focus:outline-none focus:border-primary ${error ? 'border-expense' : 'border-border'}`}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input 
                type="text" 
                data-gramm="false"
                className={`border p-3 rounded-md transition-colors text-black focus:outline-none focus:border-primary ${error ? 'border-expense' : 'border-border'}`}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              data-gramm="false"
              className={`border p-3 rounded-md transition-colors text-black focus:outline-none focus:border-primary ${error ? 'border-expense' : 'border-border'}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Role Selection</label>
            <select
              className={`border p-3 rounded-md transition-colors text-black focus:outline-none focus:border-primary ${error ? 'border-expense' : 'border-border'}`}
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="VIEWER">Viewer (Read-only, Instant access)</option>
              <option value="ANALYST">Analyst (Edit access, Requires Admin Approval)</option>
            </select>
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
          {success && <p className="text-income text-sm">{success}</p>}

          <button 
            type="submit" 
            disabled={loading || !!success}
            className="mt-4 bg-primary hover:bg-primary-hover text-white p-3 rounded-md font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-sm text-text-subtle text-center">
          Already have an account? <a href="/login" className="text-primary hover:underline font-medium">Sign In</a>
        </p>
        <p className="mt-2 text-xs text-text-subtle text-center italic">
          Note: Only an admin can add or upgrade users to Analyst/Admin roles. By default, you will be assigned the Viewer role.
        </p>
      </div>
    </div>
  );
}
