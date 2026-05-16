import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, selectAgents, selectIsAdmin } from '../redux/auth/authSlice';
import { AGENT_CONFIGS } from '../config/agents';
import { ArrowRight, Bot, Sparkles, Mail, Settings } from 'lucide-react';
import * as Icons from 'lucide-react';
import { financialApi } from '../modules/financial-advisor/api/financialApi';

function AgentCard({ config, onClick }) {
  const Icon = Icons[config.icon] ?? Icons.Bot;
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left group hover:shadow-card-md hover:border-primary-200 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Icon size={20} style={{ color: config.color }} />
        </div>
        <ArrowRight size={16} className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{config.label}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{config.description}</p>
    </button>
  );
}

function SetupPromptCard({ onNavigate }) {
  return (
    <div className="card p-5 mb-6 border-primary-200 bg-gradient-to-r from-primary-50/50 to-blue-50/50">
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Mail size={18} className="text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Complete your setup</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Connect your Gmail accounts to automatically track transactions from all your banks — no manual entry needed.
          </p>
          <button onClick={onNavigate} className="btn-primary btn-sm">
            <Settings size={13} /> Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const user      = useSelector(selectUser);
  const agents    = useSelector(selectAgents);
  const isAdmin   = useSelector(selectIsAdmin);
  const [showSetup, setShowSetup] = useState(false);

  const accessibleAgents = Object.values(AGENT_CONFIGS).filter(
    (cfg) => isAdmin || agents.includes(cfg.id),
  );

  useEffect(() => {
    financialApi.getGmailAccounts()
      .then((data) => setShowSetup(Array.isArray(data) && data.length === 0))
      .catch(() => setShowSetup(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {greeting}, {user?.firstName ?? 'there'} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Here's an overview of your active agents and services.
        </p>
      </div>

      {/* Setup prompt — only when no Gmail accounts */}
      {showSetup && <SetupPromptCard onNavigate={() => navigate('/settings')} />}

      {/* Active agents */}
      {accessibleAgents.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Your Agents
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleAgents.map((cfg) => (
              <AgentCard
                key={cfg.id}
                config={cfg}
                onClick={() => navigate(cfg.sections[0].path)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Bot size={24} className="text-primary-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">No agents yet</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            You don't have any active agent subscriptions. Contact your administrator to get access.
          </p>
        </div>
      )}

      {/* Quick tips */}
      {!showSetup && (
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary-600/5 to-primary-400/5 border border-primary-100">
          <div className="flex gap-3">
            <Sparkles size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Pro tip</p>
              <p className="text-xs text-slate-600">
                Connect your Gmail account in the Financial Advisor to automatically track all your bank transactions — no manual entry needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
