import { useState } from 'react';
import { useTransactions } from './hooks/useFinancial';
import { DataTable, ChartWidget, MetricCard, InsightCard, PageHeader } from '../../components/common';
import GmailConnect from './components/GmailConnect';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { TrendingDown, AlertTriangle, ShoppingCart, Coffee, Zap, Plus, Upload } from 'lucide-react';
import AddTransactionModal from './components/AddTransactionModal';
import clsx from 'clsx';
import dayjs from 'dayjs';

// ─── Category badge ──────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  'Food & Dining':   { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Shopping':        { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Transport':       { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  'Utilities':       { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'Entertainment':   { bg: 'bg-pink-50',   text: 'text-pink-700'   },
  'Healthcare':      { bg: 'bg-red-50',    text: 'text-red-700'    },
  'Investment':      { bg: 'bg-green-50',  text: 'text-green-700'  },
  'Other':           { bg: 'bg-slate-50',  text: 'text-slate-700'  },
};

function CategoryBadge({ category }) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other;
  return (
    <span className={clsx('badge', style.bg, style.text)}>{category ?? 'Other'}</span>
  );
}

const COLUMNS = [
  {
    key: 'date',
    header: 'Date',
    width: '120px',
    render: (v) => (
      <span className="text-slate-500 text-xs">{dayjs(v).format('DD MMM YYYY')}</span>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    render: (v, row) => (
      <div>
        <p className="text-slate-800 font-medium text-sm">{v}</p>
        {row.merchant && <p className="text-xs text-slate-400">{row.merchant}</p>}
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    width: '150px',
    render: (v) => <CategoryBadge category={v} />,
  },
  {
    key: 'source',
    header: 'Source',
    width: '90px',
    render: (v) => (
      <span className={clsx('badge', v === 'gmail' ? 'badge-blue' : v === 'pdf' ? 'badge-yellow' : 'badge-green')}>
        {v ?? 'manual'}
      </span>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    width: '110px',
    align: 'right',
    render: (v, row) => (
      <span className={clsx('font-semibold text-sm', row.type === 'credit' ? 'text-emerald-600' : 'text-slate-800')}>
        {row.type === 'credit' ? '+' : '-'}₹{Math.abs(Number(v ?? 0)).toLocaleString('en-IN')}
      </span>
    ),
  },
];

const PERIOD_OPTIONS = [
  { label: 'This month', value: 'month' },
  { label: 'Last 3 months', value: '3months' },
  { label: 'Last 6 months', value: '6months' },
  { label: 'This year', value: 'year' },
];

export default function FASpending() {
  const [period,  setPeriod]  = useState('month');
  const [showAdd, setShowAdd] = useState(false);
  const { data, loading, refetch } = useTransactions({ period });

  const transactions  = data?.transactions  ?? [];
  const categoryData  = data?.categoryChart ?? [];
  const weeklyData    = data?.weeklyChart   ?? [];
  const totalSpend    = data?.totalSpend    ?? 0;
  const topCategory   = data?.topCategory   ?? '—';
  const avgDaily      = data?.avgDaily      ?? 0;
  const anomalyCount  = data?.anomalyCount  ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Spending Tracker"
        subtitle="Understand where your money goes"
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm">
              <Plus size={13} /> Add Transaction
            </button>
          </div>
        }
      />

      <GmailConnect onConnected={refetch} />

      {/* Period selector */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5 w-fit">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={clsx(
              'text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
              period === opt.value
                ? 'bg-white text-slate-800 shadow-card'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Spent"   value={`₹${Number(totalSpend).toLocaleString('en-IN')}`} icon={<TrendingDown size={18}/>} iconBg="bg-red-50"    iconColor="text-red-500"    loading={loading} />
        <MetricCard title="Top Category"  value={topCategory}                                       icon={<ShoppingCart size={18}/>} iconBg="bg-purple-50" iconColor="text-purple-600" loading={loading} />
        <MetricCard title="Avg Daily"     value={`₹${Number(avgDaily).toLocaleString('en-IN')}`}    icon={<Coffee size={18}/>}       iconBg="bg-amber-50"  iconColor="text-amber-600"  loading={loading} />
        <MetricCard
          title="Anomalies"
          value={anomalyCount}
          subtitle="Unusual transactions detected"
          icon={<AlertTriangle size={18}/>}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Weekly spending */}
        <ChartWidget title="Weekly Spending" subtitle="Day-by-day breakdown" loading={loading} empty={!loading && !weeklyData.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Spent']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>

        {/* Category spending */}
        <ChartWidget title="By Category" subtitle="Spending split across categories" loading={loading} empty={!loading && !categoryData.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, bottom: 0, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Spent']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="amount" radius={[0,4,4,0]}>
                {categoryData.map((_, i) => (
                  <rect key={i} fill={['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* Anomaly insight */}
      {anomalyCount > 0 && !loading && (
        <div className="mb-5">
          <InsightCard
            type="warning"
            title={`${anomalyCount} unusual transaction${anomalyCount > 1 ? 's' : ''} detected`}
            body="We found transactions that are significantly higher than your average. Review them below to ensure accuracy."
          />
        </div>
      )}

      {/* Transaction table */}
      <DataTable
        columns={COLUMNS}
        data={transactions}
        loading={loading}
        searchable
        searchKeys={['description', 'merchant', 'category']}
        pageSize={15}
        rowKey="id"
        emptyText="No transactions found. Connect Gmail or add one manually."
      />

      {showAdd && (
        <AddTransactionModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); refetch(); }}
        />
      )}
    </div>
  );
}
