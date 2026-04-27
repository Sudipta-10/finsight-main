'use client';
import { useAuthStore } from '@/store/auth.store';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-surface border border-border mt-0 rounded-2xl p-10 shadow-sm max-w-2xl">
      <h2 className="font-display text-4xl mb-8">My Profile</h2>
      
      <div className="flex items-center gap-8 mb-10 pb-10 border-b border-border">
        <div className="relative rounded-full overflow-hidden w-28 h-28 flex items-center justify-center border-[3px] border-primary/20 bg-gradient-to-br from-primary/10 to-primary/30 shadow-md">
          <span className="text-4xl tracking-widest font-display font-semibold text-primary/80">
            {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
          </span>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">{user?.first_name} {user?.last_name}</h3>
          <p className="text-text-subtle mb-3">{user?.email}</p>
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded inline-block">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-text-subtle mb-1">First Name</p>
            <p className="font-medium text-lg text-gray-900">{user?.first_name}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-text-subtle mb-1">Last Name</p>
            <p className="font-medium text-lg text-gray-900">{user?.last_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
