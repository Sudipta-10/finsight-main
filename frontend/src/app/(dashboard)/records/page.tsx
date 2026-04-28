'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useAuthStore } from '@/store/auth.store';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

export default function RecordsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form, setForm] = useState({ amount: '', type: 'EXPENSE', category: '', date: '', description: '' });

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const q = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (type) q.append('type', type);
  if (debouncedSearch) q.append('search', debouncedSearch);
  const url = `/records?${q.toString()}`;

  const fetcher = (url: string) => api.get(url).then(res => res.data);
  const { data, error, isLoading: loading, mutate: loadRecords } = useSWR(url, fetcher, { keepPreviousData: true });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      loadRecords();
    } catch (err) {
      alert('Failed to delete');
    }
  };

    const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editingRecord) {
        await api.patch(`/records/${editingRecord.id}`, payload);
      } else {
        await api.post('/records', payload);
      }
      setIsModalOpen(false);
      loadRecords();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const openForm = (record?: any) => {
    if (record) {
      setEditingRecord(record);
      setForm({ 
        amount: record.amount.toString(), 
        type: record.type, 
        category: record.category, 
        date: record.date.split('T')[0], 
        description: record.description || '' 
      });
    } else {
      setEditingRecord(null);
      setForm({ amount: '', type: 'EXPENSE', category: '', date: '', description: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border mt-0 rounded-lg shadow-sm">
      <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 w-full sm:w-auto">
          <select 
            value={type} 
            onChange={e => { setType(e.target.value); setPage(1); }}
            className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search description..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-border rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'ANALYST') && (
          <button 
            onClick={() => openForm()}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} /> New Record
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg sticky top-0 shadow-sm border-b border-border text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-text-subtle">Loading data...</td></tr>
            ) : data?.data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-text-subtle">No records found.</td></tr>
            ) : (
              data?.data.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">{formatDate(r.date)}</td>
                  <td className="px-6 py-4 text-gray-900 truncate max-w-[200px]" title={r.description}>{r.description || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">{r.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-gray-900">
                    <span className={r.type === 'INCOME' ? 'text-income' : 'text-gray-900'}>
                      {r.type === 'INCOME' ? '+' : '-'}{formatCurrency(r.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2 text-gray-400">
                      {(user?.role === 'ADMIN' || user?.role === 'ANALYST') && (
                        <button onClick={() => openForm(r)} className="hover:text-primary"><Edit2 size={16} /></button>
                      )}
                      {user?.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(r.id)} className="hover:text-expense"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing page {data?.page || 1} of {data?.totalPages || 1}
        </div>
        <div className="flex gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border border-border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <button 
            disabled={!data || page >= data.totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border border-border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRecord ? "Edit Record" : "New Record"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select 
                required value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="border border-border p-2.5 rounded-md focus:border-primary focus:outline-none"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Amount (₹)</label>
              <input 
                required type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                className="border border-border p-2.5 rounded-md focus:border-primary focus:outline-none font-mono"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <input 
              required type="text" placeholder="e.g. Software Services" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="border border-border p-2.5 rounded-md focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input 
              required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
              className="border border-border p-2.5 rounded-md focus:border-primary focus:outline-none font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea 
              rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="border border-border p-2.5 rounded-md focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <button disabled={saving} type="submit" className="mt-4 bg-primary text-white py-3 rounded-md hover:bg-primary-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
