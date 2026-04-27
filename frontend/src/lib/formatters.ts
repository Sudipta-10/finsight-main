export const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));

export const formatCompactCurrency = (amount: string | number) => {
  const num = Number(amount);
  if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(2)} K`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

export const formatDate = (date: string | Date | undefined) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
};

export const formatPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
