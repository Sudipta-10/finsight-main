'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#0F2B5B', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6'];

export interface CategoryBreakdown {
  category: string;
  total: number;
}

export function CategoryPieChart({ data }: { data: CategoryBreakdown[] }) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-text-subtle text-sm">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
             dataKey="total" nameKey="category" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`}
                 contentStyle={{ fontFamily: 'var(--font-dm-sans)', borderRadius: 8 }} />
        <Legend iconType="circle" wrapperStyle={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
