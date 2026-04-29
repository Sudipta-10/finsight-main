'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import useSWR from 'swr';
import { useAuthStore } from '@/store/auth.store';
import { Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'VIEWER' });

  const { user } = useAuthStore();
  const fetcher = (url: string) => api.get(url).then(res => res.data);
  const { data, error, isLoading: loading, mutate: loadUsers } = useSWR(`/users?page=${page}&limit=${limit}`, fetcher, { keepPreviousData: true });

  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', form);
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (userRecord: any) => {
    try {
      await api.patch(`/users/${userRecord.id}`, { isActive: !userRecord.is_active });
      loadUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-10 text-center text-text-subtle">Restricted Area</div>;
  }

  return (
    <div className="flex flex-col h-full bg-surface border border-border mt-0 rounded-lg shadow-sm">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="font-sans font-medium text-lg text-gray-900">User Management</h3>
        <button 
          onClick={() => { setForm({ email: '', password: '', firstName: '', lastName: '', role: 'VIEWER' }); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add User
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg sticky top-0 shadow-sm border-b border-border text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-text-subtle">Loading data...</td></tr>
            ) : (
              data?.data.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-income' : 'bg-gray-300'}`}></div>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </div>
                    {u.approval_status !== 'APPROVED' && (
                      <span className={`text-xs font-semibold ${u.approval_status === 'PENDING' ? 'text-amber-600' : 'text-expense'}`}>
                        {u.approval_status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    {u.approval_status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={async () => { await api.patch(`/users/${u.id}`, { approvalStatus: 'APPROVED' }); loadUsers(); }}
                          className="text-xs font-medium px-3 py-1.5 rounded-md bg-income text-white hover:opacity-90"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={async () => { await api.patch(`/users/${u.id}`, { approvalStatus: 'REJECTED' }); loadUsers(); }}
                          className="text-xs font-medium px-3 py-1.5 rounded-md bg-expense text-white hover:opacity-90"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => toggleStatus(u)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md border ${u.is_active ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border flex justify-between items-center text-sm text-gray-500">
        <div>
          Page {data?.meta?.page || 1} of {data?.meta?.totalPages || 1}
        </div>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-border rounded-md">Prev</button>
          <button disabled={!data || page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-border rounded-md">Next</button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="border p-2.5 rounded-md focus:border-primary outline-none" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="border p-2.5 rounded-md focus:border-primary outline-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border p-2.5 rounded-md focus:border-primary outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Initial Password</label>
            <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="border p-2.5 rounded-md focus:border-primary outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="border p-2.5 rounded-md focus:border-primary outline-none">
              <option value="VIEWER">Viewer</option>
              <option value="ANALYST">Analyst</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button disabled={saving} type="submit" className="mt-4 bg-primary text-white py-3 rounded-md hover:bg-primary-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
