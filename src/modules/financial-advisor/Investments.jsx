import { useState } from 'react';
import { useInvestments, useInsights } from './hooks/useFinancial';
import { MetricCard, InsightCard, ChartWidget, PageHeader } from '../../components/common';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Shield, Zap, Info, CheckCircle, Lock } from 'lucide-react';
import clsx from 'clsx';

// ─── Risk profiler ────────────────────────────────────────────────────────────
const RISK_QUESTIONS = [
  {
    id: 'horizon',
    q: 'How long can you keep your money invested?',
    options: [
      { label: 'Less than 1 year',  score: 1 },
      { label: '1–3 years',         score: 2 },
      { label: '3–7 years',         score: 3 },
      { label: 'More than 7 years', score: 4 },
    ],
  },
  {
    id: 'reaction',
    q: 'If your portfolio dropped 20% in a month, you would:',
    options: [
      { label: 'Sell everything immediately',   score: 1 },
      { label: 'Sell some and wait',             score: 2 },
      { label: 'Hold and do nothing',            score: 3 },
      { label: 'Buy more at the lower price',    score: 4 },
    ],
  },
  {
    id: 'goal',
    q: 'What is your primary investment goal?',
    options: [
      { label: 'Capital preservation (safety first)', score: 1 },
      { label: 'Steady income',                       score: 2 },
      { label: 'Balanced growth & income',            score: 3 },
      { label: 'Maximum long-term growth',            score: 4 },
    ],
  },
  {
    id: 'experience',
    q: 'Your investment experience level:',
    options: [
      { label: 'None — first time',   score: 1 },
      { label: 'Basic — FDs/RDs only',score: 2 },
      { label: 'Intermediate — MFs',  score: 3 },
      { label: 'Advanced — stocks/ETFs', score: 4 },
    ],
  },
];

function getRiskProfile(score) {
  if (score <= 5)  return { label: 'Conservative',  color: 'text-blue-600',   bg: 'bg-blue-50',   allocation: { 'Debt/FD': 65, 'Hybrid MF': 20, 'Equity': 10, 'Gold': 5  } };
  if (score <= 9)  return { label: 'Moderate',      color: 'text-amber-600',  bg: 'bg-amber-50',  allocation: { 'Debt/FD': 35, 'Hybrid MF': 30, 'Equity': 25, 'Gold': 10 } };
  if (score <= 13) return { label: 'Balanced',      color: 'text-purple-600', bg: 'bg-purple-50', allocation: { 'Debt/FD': 20, 'Hybrid MF': 25, 'Equity': 45, 'Gold': 10 } };
  return            { label: 'Aggressive',           color: 'text-red-600',    bg: 'bg-red-50',    allocation: { 'Debt/FD': 10, 'Hybrid MF': 10, 'Equity': 70, 'Gold': 10 } };
}

const ALLOC_COLORS = { 'Debt/FD': '#3b82f6', 'Hybrid MF': '#8b5cf6', 'Equity': '#10b981', 'Gold': '#f59e0b' };

// ─── Investment recommendation cards ─────────────────────────────────────────
const INVESTMENT_RECOMMENDATIONS = {
  Conservative: [
    { name: 'SBI Fixed Deposit', type: 'Debt', returns: '7.1%', risk: 'Very Low', horizon: '1–5 yr', highlight: 'Guaranteed returns, fully insured up to ₹5L' },
    { name: 'HDFC Hybrid Equity Fund', type: 'Hybrid MF', returns: '10–12%', risk: 'Low', horizon: '3+ yr', highlight: 'Balance of safety and growth' },
    { name: 'Sovereign Gold Bond', type: 'Gold', returns: '8–10%', risk: 'Low', horizon: '5–8 yr', highlight: 'Govt backed, tax-free on maturity' },
  ],
  Moderate: [
    { name: 'Parag Parikh Flexi Cap Fund', type: 'Equity MF', returns: '14–16%', risk: 'Medium', horizon: '5+ yr', highlight: 'Diversified across Indian and global stocks' },
    { name: 'ICICI Prudential Bond Fund', type: 'Debt', returns: '7.5%', risk: 'Low', horizon: '2–3 yr', highlight: 'Stable income component' },
    { name: 'Nippon India Small Cap Fund', type: 'Small Cap', returns: '18–22%', risk: 'Medium-High', horizon: '7+ yr', highlight: 'High growth potential' },
  ],
  Balanced: [
    { name: 'Mirae Asset Large Cap Fund', type: 'Large Cap', returns: '13–15%', risk: 'Medium', horizon: '5+ yr', highlight: 'Steady blue-chip growth' },
    { name: 'Axis Mid Cap Fund', type: 'Mid Cap', returns: '16–19%', risk: 'Medium-High', horizon: '5+ yr', highlight: 'Best mid-cap growth play' },
    { name: 'Nifty 50 Index ETF', type: 'Index', returns: '12–14%', risk: 'Market', horizon: '7+ yr', highlight: 'Lowest cost, tracks Nifty 50' },
  ],
  Aggressive: [
    { name: 'Quant Small Cap Fund', type: 'Small Cap', returns: '22–28%', risk: 'High', horizon: '7+ yr', highlight: 'Top performing small cap fund' },
    { name: 'HDFC Technology Fund', type: 'Sectoral', returns: '18–24%', risk: 'High', horizon: '5+ yr', highlight: 'Concentrated tech sector growth' },
    { name: 'Motilal Oswal Nasdaq 100', type: 'International', returns: '15–20%', risk: 'High', horizon: '5+ yr', highlight: 'US tech exposure via Indian route' },
  ],
};

const RISK_ICONS = { 'Very Low': Shield, 'Low': Shield, 'Medium': TrendingUp, 'Medium-High': TrendingUp, 'High': Zap, 'Market': BarChart3 };

function RecommendationCard({ rec, index }) {
  const RiskIcon = RISK_ICONS[rec.risk] ?? TrendingUp;
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-800">{rec.name}</p>
          <span className="badge badge-blue text-[10px] mt-0.5">{rec.type}</span>
        </div>
        <span className="text-lg font-black text-primary-600">{rec.returns}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{rec.highlight}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-slate-500">
          <RiskIcon size={11} /> {rec.risk} risk
        </span>
        <span className="text-slate-500">{rec.horizon}</span>
      </div>
    </div>
  );
}

export default function FAInvestments() {
  const [answers,    setAnswers]    = useState({});
  const [profileDone,setProfileDone]= useState(false);

  const score       = Object.values(answers).reduce((s, v) => s + v, 0);
  const riskProfile = getRiskProfile(score);
  const recs        = INVESTMENT_RECOMMENDATIONS[riskProfile.label] ?? [];
  const allAnswered = RISK_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const allocationData = Object.entries(riskProfile.allocation).map(([name, value]) => ({ name, value }));
  const radarData = Object.entries(riskProfile.allocation).map(([label, val]) => ({ label, val }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Investment Advisor"
        subtitle="Personalised investment recommendations based on your financial profile"
      />

      {/* Risk profiler */}
      {!profileDone ? (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="text-sm font-bold text-slate-800">Risk Profile Assessment</h3>
            <p className="text-xs text-slate-500 mt-0.5">Answer 4 quick questions to get personalised recommendations</p>
          </div>
          <div className="card-body space-y-6">
            {RISK_QUESTIONS.map((q) => (
              <div key={q.id}>
                <p className="text-sm font-semibold text-slate-700 mb-2">{q.q}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.score}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.score }))}
                      className={clsx(
                        'text-left text-xs px-3 py-2.5 rounded-lg border transition-all',
                        answers[q.id] === opt.score
                          ? 'bg-primary-50 border-primary-400 text-primary-700 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50/50',
                      )}
                    >
                      {answers[q.id] === opt.score && <CheckCircle size={11} className="inline mr-1 text-primary-600" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              disabled={!allAnswered}
              onClick={() => setProfileDone(true)}
              className="btn-primary w-full sm:w-auto"
            >
              {!allAnswered
                ? <><Lock size={13}/> Answer all questions to continue</>
                : <><Zap size={13}/> Generate My Investment Plan</>
              }
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Profile result badge */}
          <div className={clsx('rounded-xl border p-4 mb-6 flex items-center justify-between gap-3', riskProfile.bg, 'border-current/20')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-card">
                <TrendingUp size={18} className={riskProfile.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Your risk profile</p>
                <p className={clsx('text-base font-black', riskProfile.color)}>{riskProfile.label} Investor</p>
              </div>
            </div>
            <button onClick={() => setProfileDone(false)} className="btn-ghost btn-sm text-xs">
              Retake quiz
            </button>
          </div>

          {/* Portfolio allocation + radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <ChartWidget title="Recommended Allocation" subtitle="Ideal portfolio split for your risk profile" height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                    {allocationData.map((e) => <Cell key={e.name} fill={ALLOC_COLORS[e.name]} />)}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Allocation']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartWidget>

            <ChartWidget title="Asset Balance" subtitle="Your diversification radar" height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 70]} tick={false} axisLine={false} />
                  <Radar name="Allocation" dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartWidget>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-slate-800">Top Picks for You</h3>
              <span className="badge badge-blue">AI Curated</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {recs.map((rec, i) => <RecommendationCard key={i} rec={rec} index={i} />)}
            </div>

            <InsightCard
              type="info"
              title="Disclaimer"
              body="These recommendations are generated based on your self-assessed risk profile and market data analysis. Always consult a SEBI-registered financial advisor before making investment decisions. Past returns are not indicative of future performance."
            />
          </div>
        </>
      )}
    </div>
  );
}
