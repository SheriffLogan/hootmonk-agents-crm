import { useState, useEffect, useCallback } from 'react';
import { useOverview, useInsights } from './hooks/useFinancial';
import { MetricCard, ChartWidget, InsightCard, PageHeader } from '../../components/common';
import GmailConnect from './components/GmailConnect';
import { financialApi } from './api/financialApi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Wallet, TrendingDown, PiggyBank, BarChart3, RefreshCw,
  TrendingUp, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';

const CATEGORY_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#06b6d4'];

const inr = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v ?? 0);

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
        <p key={i} style={{ color: p.color }}>{p.name}: {inr(p.value)}</p>
      ))}
    </div>
  );
}

function CombinedOverviewCard({ data, loading }) {
  if (loading) {
    return (
      <div className="card p-5 mb-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-40 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  if (!data) return null;

  const savingsRate = data.savingsRate ?? 0;
  const netPositive = (data.netSavings ?? 0) >= 0;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">This Period's Overview</h3>
          {data.periodStart && data.periodEnd && (
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(data.periodStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              {' – '}
              {new Date(data.periodEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              {' · '}
              {data.transactionCount ?? 0} transactions
            </p>
          )}
        </div>
        <div className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${
          savingsRate >= 20 ? 'bg-emerald-50 text-emerald-700' :
          savingsRate >= 10 ? 'bg-yellow-50 text-yellow-700' :
          'bg-red-50 text-red-600'
        }`}>
          <TrendingUp size={11} />
          {savingsRate.toFixed(1)}% savings rate
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-emerald-50 p-3.5">
          <p className="text-xs text-emerald-700 font-medium mb-1">Total Income</p>
          <p className="text-base font-bold text-emerald-800">{inr(data.totalIncome)}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-3.5">
          <p className="text-xs text-red-700 font-medium mb-1">Total Expenses</p>
          <p className="text-base font-bold text-red-800">{inr(data.totalExpenses)}</p>
        </div>
        <div className={`rounded-xl p-3.5 col-span-2 sm:col-span-1 ${netPositive ? 'bg-primary-50' : 'bg-orange-50'}`}>
          <p className={`text-xs font-medium mb-1 ${netPositive ? 'text-primary-700' : 'text-orange-700'}`}>Net Savings</p>
          <p className={`text-base font-bold flex items-center gap-1 ${netPositive ? 'text-primary-800' : 'text-orange-700'}`}>
            {netPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {inr(Math.abs(data.netSavings ?? 0))}
          </p>
        </div>
      </div>
    </div>
  );
}

function BankBreakdownCard({ data, loading }) {
  if (loading) {
    return (
      <div className="card p-5 mb-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-xl mb-2" />
        ))}
      </div>
    );
  }
  if (!data?.length) return null;

  return (
    <div className="card p-5 mb-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Per-Bank Breakdown</h3>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-100">
              <th className="text-left py-2 px-1 font-medium">Bank</th>
              <th className="text-right py-2 px-1 font-medium">Credit</th>
              <th className="text-right py-2 px-1 font-medium">Debit</th>
              <th className="text-right py-2 px-1 font-medium">Net</th>
              <th className="text-right py-2 px-1 font-medium hidden sm:table-cell">Txns</th>
            </tr>
          </thead>
          <tbody>
            {data.map((bank, i) => {
              const netPos = (bank.net ?? 0) >= 0;
              return (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-1">
                    <p className="font-semibold text-slate-800">{bank.bankName}</p>
                    {bank.lastTransactionDate && (
                      <p className="text-slate-400 mt-0.5">
                        Last: {new Date(bank.lastTransactionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-1 text-right text-emerald-600 font-medium">{inr(bank.totalCredit)}</td>
                  <td className="py-2.5 px-1 text-right text-red-500 font-medium">{inr(bank.totalDebit)}</td>
                  <td className="py-2.5 px-1 text-right">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${netPos ? 'text-emerald-700' : 'text-red-600'}`}>
                      {netPos ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {inr(Math.abs(bank.net ?? 0))}
                    </span>
                  </td>
                  <td className="py-2.5 px-1 text-right text-slate-500 hidden sm:table-cell">{bank.transactionCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FADashboard() {
  const { data: overview, loading: ovLoading, refetch } = useOverview();
  const { data: insights, loading: insLoading }          = useInsights();
  const [combined,    setCombined]    = useState(null);
  const [byBank,      setByBank]      = useState(null);
  const [loadingExt,  setLoadingExt]  = useState(true);

  const fetchExtended = useCallback(async () => {
    setLoadingExt(true);
    try {
      const [comb, banks] = await Promise.all([
        financialApi.getCombinedOverview(),
        financialApi.getOverviewByBank(),
      ]);
      setCombined(comb);
      setByBank(Array.isArray(banks) ? banks : []);
    } catch {
      // silently ignore — overview still shows
    } finally {
      setLoadingExt(false);
    }
  }, []);

  useEffect(() => { fetchExtended(); }, [fetchExtended]);

  const handleRefetch = () => { refetch(); fetchExtended(); };

  const metrics = [
    {
      title:    'Net Worth',
      value:    overview ? inr(overview.netWorth ?? 0) : '—',
      change:   overview?.netWorthChange,
      icon:     <Wallet size={18} />,
      iconBg:   'bg-primary-50',
      iconColor:'text-primary-600',
    },
    {
      title:    'Monthly Spending',
      value:    overview ? inr(overview.monthlySpend ?? 0) : '—',
      change:   overview?.spendChange,
      icon:     <TrendingDown size={18} />,
      iconBg:   'bg-red-50',
      iconColor:'text-red-500',
    },
    {
      title:    'Total Savings',
      value:    overview ? inr(overview.totalSavings ?? 0) : '—',
      change:   overview?.savingsChange,
      icon:     <PiggyBank size={18} />,
      iconBg:   'bg-emerald-50',
      iconColor:'text-emerald-600',
    },
    {
      title:    'Portfolio Value',
      value:    overview ? inr(overview.portfolioValue ?? 0) : '—',
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
          <button onClick={handleRefetch} className="btn-outline btn-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      <GmailConnect onConnected={handleRefetch} />

      {/* Combined overview */}
      <CombinedOverviewCard data={combined} loading={loadingExt} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} loading={ovLoading} />
        ))}
      </div>

      {/* Per-bank breakdown */}
      <BankBreakdownCard data={byBank} loading={loadingExt} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
                <Area type="monotone" dataKey="income"   name="Income"   stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#spendGrad)"  />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWidget>
        </div>

        <ChartWidget
          title="Spending by Category"
          subtitle="This month"
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
                formatter={(v) => [inr(v), 'Amount']}
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
