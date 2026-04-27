'use client';
import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { KPICard } from '@/components/dashboard/KPICard';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { formatCompactCurrency } from '@/lib/formatters';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const fetcher = (url: string) => api.get(url).then(res => res.data);
  const { data, error, isLoading: loading } = useSWR('/dashboard/analytics', fetcher);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 pb-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-2">
          <KPICard 
            label="Total Income" 
            value={data ? formatCompactCurrency(data.summary.totalIncome) : '₹0'} 
            variant="income" 
            delay={0.05}
            isLoading={loading} 
          />
        </div>
        <div className="lg:col-span-2">
          <KPICard 
            label="Total Expenses" 
            value={data ? formatCompactCurrency(data.summary.totalExpense) : '₹0'} 
            variant="expense" 
            delay={0.1}
            isLoading={loading} 
          />
        </div>
        <div className="lg:col-span-2">
          <KPICard 
            label="Net Balance" 
            value={data ? formatCompactCurrency(data.summary.netBalance) : '₹0'} 
            variant="neutral" 
            delay={0.15}
            isLoading={loading} 
          />
        </div>
        <div className="lg:col-span-3">
          <KPICard 
            label="Profit Margin" 
            value={data ? `${data.summary.profitMargin}%` : '0%'} 
            variant="income" 
            delay={0.2}
            isLoading={loading} 
          />
        </div>
        <div className="lg:col-span-3">
          <KPICard 
            label="Total Entities" 
            value={data ? String(data.summary.transactionCount) : '0'} 
            variant="neutral" 
            delay={0.25}
            isLoading={loading} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={!loading ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 60, damping: 15 }}
          className="lg:col-span-2 relative glass-panel rounded-3xl p-8 flex flex-col hover:shadow-lg transition-all overflow-hidden group hover:border-accent/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <h3 className="font-sans font-medium text-lg text-gray-900 mb-6 relative z-10">Monthly Trends</h3>
          <div className="flex-1 min-h-[300px] relative z-10">
            {loading ? (
              <div className="w-full h-full bg-gray-100/50 animate-pulse rounded-xl"></div>
            ) : (
              <MonthlyTrendChart data={data?.trend || []} />
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={!loading ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.4, type: "spring", stiffness: 60, damping: 15 }}
          className="relative glass-panel rounded-3xl p-8 flex flex-col hover:shadow-lg transition-all overflow-hidden group hover:border-accent/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <h3 className="font-sans font-medium text-lg text-gray-900 mb-6 relative z-10">Expense Breakdown</h3>
          <div className="flex-1 min-h-[300px] relative z-10">
            {loading ? (
              <div className="w-full h-full bg-gray-100/50 animate-pulse rounded-xl"></div>
            ) : (
              <CategoryPieChart data={data?.breakdown?.expense || []} />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
