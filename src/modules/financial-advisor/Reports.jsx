import { useState } from 'react';
import { useReport } from './hooks/useFinancial';
import { ChartWidget, InsightCard, PageHeader } from '../../components/common';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS  = [2025, 2026];

function SummaryRow({ label, value, change, type }) {
  const isIncome = type === 'income';
  const isUp     = change > 0;
  const isNeutral= change === 0;
  const ChangeIcon = isNeutral ? Minus : isUp ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-600">{label}</p>
      <div className="flex items-center gap-3">
        {change !== undefined && (
          <span className={clsx(
            'flex items-center gap-0.5 text-xs font-medium',
            isNeutral ? 'text-slate-500' :
            (isIncome ? isUp : !isUp) ? 'text-emerald-600' : 'text-red-600',
          )}>
            <ChangeIcon size={11}/>
            {isNeutral ? '0' : `${Math.abs(change)}%`}
          </span>
        )}
        <span className="text-sm font-bold text-slate-800">
          ₹{Number(value ?? 0).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

export default function FAReports() {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [year,   setYear]   = useState(currentYear);
  const [month,  setMonth]  = useState(currentMonth);
  const [view,   setView]   = useState('monthly'); // 'monthly' | 'annual'

  const params = view === 'monthly' ? { year, month: month + 1 } : { year };
  const { data: report, loading } = useReport(params);

  const summary  = report?.summary  ?? {};
  const monthly  = report?.monthly  ?? [];
  const catData  = report?.byCat    ?? [];

  const handleDownload = () => {
    // Future: trigger PDF generation via backend
    alert('PDF export will be available soon. Your report data is ready.');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Financial Reports"
        subtitle="Detailed breakdown of your financial activity"
        actions={
          <button onClick={handleDownload} className="btn-outline btn-sm">
            <Download size={13}/> Export PDF
          </button>
        }
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* View toggle */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {['monthly', 'annual'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx(
                'text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all',
                view === v ? 'bg-white text-slate-800 shadow-card' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Year picker */}
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-slate-400" />
          <select value={year} onChange={(e) => setYear(+e.target.value)} className="input text-xs py-1.5 w-24">
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Month picker — only in monthly view */}
        {view === 'monthly' && (
          <select value={month} onChange={(e) => setMonth(+e.target.value)} className="input text-xs py-1.5 w-32">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-bold text-slate-800">
              {view === 'monthly' ? `${MONTHS[month]} ${year}` : `${year}`} Summary
            </h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-5 bg-slate-100 rounded animate-pulse"/>)}
              </div>
            ) : (
              <>
                <SummaryRow label="Total Income"    value={summary.income}   change={summary.incomeChange}   type="income"  />
                <SummaryRow label="Total Expenses"  value={summary.expenses} change={summary.expenseChange}  type="expense" />
                <SummaryRow label="Net Savings"     value={summary.savings}  change={summary.savingsChange}  type="income"  />
                <SummaryRow label="Savings Rate"    value={undefined}        change={undefined} />
                <div className="flex items-center justify-between py-3">
                  <p className="text-sm text-slate-600">Savings Rate</p>
                  <span className={clsx(
                    'text-sm font-black',
                    (summary.savingsRate ?? 0) >= 20 ? 'text-emerald-600' : (summary.savingsRate ?? 0) >= 10 ? 'text-amber-600' : 'text-red-600',
                  )}>
                    {summary.savingsRate ?? 0}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <ChartWidget title="Expense Breakdown" subtitle="Where did your money go?" loading={loading} empty={!loading && !catData.length} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="amount" fill="#6366f1" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* Monthly trend (annual view) */}
      {view === 'annual' && (
        <ChartWidget title="Monthly Trend" subtitle={`Income vs expenses — ${year}`} loading={loading} empty={!loading && !monthly.length} className="mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="income"   name="Income"   stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="savings"  name="Savings"  stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </ChartWidget>
      )}

      {/* AI insight */}
      {!loading && summary.income && (
        <InsightCard
          type={summary.savingsRate >= 20 ? 'success' : summary.savingsRate >= 10 ? 'tip' : 'warning'}
          title={summary.savingsRate >= 20
            ? 'Excellent savings rate!'
            : summary.savingsRate >= 10
              ? 'Good progress — room to improve'
              : 'Your savings rate needs attention'}
          body={summary.savingsRate >= 20
            ? `You're saving ${summary.savingsRate}% of your income — well above the recommended 20%. Keep it up! Consider investing the surplus for long-term wealth creation.`
            : summary.savingsRate >= 10
              ? `You're saving ${summary.savingsRate}%. The 50/30/20 rule suggests aiming for at least 20%. Try reducing discretionary spending by ₹${Math.ceil((0.20 * summary.income - summary.savings) / 1000) * 1000} this month.`
              : `Your savings rate is only ${summary.savingsRate}%. This is a red flag. Identify your top 2 expense categories and target a 10–15% reduction to quickly improve your financial health.`
          }
        />
      )}
    </div>
  );
}
