'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export function MonthlyTrendChart({ data }: { data: MonthlyTrend[] }) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-text-subtle text-sm">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fill: '#6B7280' }} />
        <YAxis tick={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: 11, fill: '#6B7280' }}
               tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                 contentStyle={{ fontFamily: 'var(--font-dm-sans)', borderRadius: 8, border: '1px solid #E5E7EB' }} />
        <Legend wrapperStyle={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13 }} />
        <Area type="monotone" dataKey="income"   stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)"  name="Income" />
        <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expense" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
