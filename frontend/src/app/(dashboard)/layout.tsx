'use client';

import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, User, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-transparent selection:bg-accent/30 selection:text-primary">
      {}
      <aside className="relative w-64 flex-shrink-0 bg-sidebar-bg/95 backdrop-blur-xl border-r border-white/10 text-sidebar-text flex flex-col shadow-2xl z-20">
        <div className="p-6 font-display text-2xl tracking-wide border-b border-white/5 relative overflow-hidden">
          {}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 drop-shadow-sm">FINSIGHT</span>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          <Link href="/dashboard" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/dashboard' ? 'bg-accent text-white font-medium shadow-glow' : 'hover:bg-sidebar-hover hover:translate-x-1'}`}>
            <LayoutDashboard size={20} className={pathname === '/dashboard' ? 'text-white' : 'text-sidebar-text group-hover:text-white transition-colors'}/> Dashboard
          </Link>
          <Link href="/records" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname.startsWith('/records') ? 'bg-accent text-white font-medium shadow-glow' : 'hover:bg-sidebar-hover hover:translate-x-1'}`}>
            <FileText size={20} className={pathname.startsWith('/records') ? 'text-white' : 'text-sidebar-text group-hover:text-white transition-colors'}/> Records
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/users" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/users' ? 'bg-accent text-white font-medium shadow-glow' : 'hover:bg-sidebar-hover hover:translate-x-1'}`}>
              <Users size={20} className={pathname === '/users' ? 'text-white' : 'text-sidebar-text group-hover:text-white transition-colors'}/> Users
            </Link>
          )}
          <Link href="/profile" className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/profile' ? 'bg-accent text-white font-medium shadow-glow' : 'hover:bg-sidebar-hover hover:translate-x-1'}`}>
            <User size={20} className={pathname === '/profile' ? 'text-white' : 'text-sidebar-text group-hover:text-white transition-colors'}/> Profile
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5 bg-black/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-accent-light to-accent flex items-center justify-center border border-white/20 shrink-0 text-primary font-bold text-sm tracking-widest shadow-md">
                {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar-bg" />
              </div>
              <div className="text-sm min-w-0">
                <p className="font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-sidebar-text/70 uppercase tracking-wider font-medium truncate mt-0.5">{user?.role}</p>
              </div>
            </div>
            <button onClick={async () => { 
                try { await api.post('/auth/logout'); } catch (e) {} 
                logout(); 
                Cookies.remove('accessToken'); 
                window.location.href='/login'; 
              }} 
              title="Logout" 
              className="p-2 hover:bg-white/10 rounded-xl text-sidebar-text/70 hover:text-white transition-all hover:scale-110 active:scale-95">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto flex flex-col relative">
        {}
        <header className="h-20 border-b border-white/30 bg-white/40 backdrop-blur-xl flex flex-shrink-0 items-center px-8 z-10 sticky top-0 shadow-sm transition-all duration-300">
          <h2 className="font-display font-medium text-2xl text-primary capitalize flex-1 tracking-tight drop-shadow-sm">
            {pathname.split('/')[1] || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
             {}
             <div className="h-8 w-8 rounded-full bg-white/60 border border-white/50 shadow-sm flex items-center justify-center animate-pulseGlow cursor-pointer hover:bg-white transition-colors">
               <div className="w-2 h-2 bg-accent rounded-full" />
             </div>
          </div>
        </header>
        
        {}
        <div className="p-8 flex-1 max-w-7xl mx-auto w-full relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
}
