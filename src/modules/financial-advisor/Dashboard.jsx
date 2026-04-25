import { useOverview, useInsights } from './hooks/useFinancial';
import { MetricCard, ChartWidget, InsightCard, PageHeader } from '../../components/common';
import GmailConnect from './components/GmailConnect';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Wallet, TrendingDown, PiggyBank, BarChart3, RefreshCw } from 'lucide-react';

// ─── Chart colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#06b6d4'];

function CategoryLegend({ payload }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
      {payload.map((e, i) => (
        <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: e.color }} />
          {e.value}
        </li>
      ))}
    </ul>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card-md px-3 py-2.5 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: ₹{Number(p.value).toLocaleString('en-IN')}</p>
      ))}
    </div>
  );
}

export default function FADashboard() {
  const { data: overview, loading: ovLoading, refetch } = useOverview();
  const { data: insights, loading: insLoading }          = useInsights();

  const metrics = [
    {
      title:    'Net Worth',
      value:    overview ? `₹${Number(overview.netWorth ?? 0).toLocaleString('en-IN')}` : '—',
      change:   overview?.netWorthChange,
      icon:     <Wallet size={18} />,
      iconBg:   'bg-primary-50',
      iconColor:'text-primary-600',
    },
    {
      title:    'Monthly Spending',
      value:    overview ? `₹${Number(overview.monthlySpend ?? 0).toLocaleString('en-IN')}` : '—',
      change:   overview?.spendChange,
      icon:     <TrendingDown size={18} />,
      iconBg:   'bg-red-50',
      iconColor:'text-red-500',
    },
    {
      title:    'Total Savings',
      value:    overview ? `₹${Number(overview.totalSavings ?? 0).toLocaleString('en-IN')}` : '—',
      change:   overview?.savingsChange,
      icon:     <PiggyBank size={18} />,
      iconBg:   'bg-emerald-50',
      iconColor:'text-emerald-600',
    },
    {
      title:    'Portfolio Value',
      value:    overview ? `₹${Number(overview.portfolioValue ?? 0).toLocaleString('en-IN')}` : '—',
      change:   overview?.portfolioChange,
      icon:     <BarChart3 size={18} />,
      iconBg:   'bg-blue-50',
      iconColor:'text-blue-600',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Financial Overview"
        subtitle="Your complete financial picture at a glance"
        actions={
          <button onClick={refetch} className="btn-outline btn-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* Gmail connect prompt */}
      <GmailConnect onConnected={refetch} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} loading={ovLoading} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Spending trend */}
        <div className="lg:col-span-2">
          <ChartWidget
            title="Spending Trend"
            subtitle="Income vs expenses over last 6 months"
            loading={ovLoading}
            empty={!ovLoading && !overview?.monthlyTrend?.length}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.monthlyTrend ?? []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"  name="Income"   stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#spendGrad)"  />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWidget>
        </div>

        {/* Spending by category */}
        <ChartWidget
          title="Spending by Category"
          subtitle={`This month`}
          loading={ovLoading}
          empty={!ovLoading && !overview?.categoryBreakdown?.length}
          height={240}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={overview?.categoryBreakdown ?? []}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                dataKey="amount"
                nameKey="category"
                paddingAngle={3}
              >
                {(overview?.categoryBreakdown ?? []).map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Legend content={<CategoryLegend />} />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Insights &amp; Recommendations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {insLoading
            ? Array.from({ length: 3 }).map((_, i) => <InsightCard key={i} loading />)
            : (insights ?? []).slice(0, 6).map((insight, i) => (
                <InsightCard
                  key={i}
                  type={insight.type}
                  title={insight.title}
                  body={insight.body}
                  action={insight.actionLabel ? { label: insight.actionLabel, onClick: () => {} } : undefined}
                />
              ))
          }
          {!insLoading && !insights?.length && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InsightCard
                type="info"
                title="No insights yet"
                body="Connect your Gmail or add some transactions to get personalized financial insights."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
