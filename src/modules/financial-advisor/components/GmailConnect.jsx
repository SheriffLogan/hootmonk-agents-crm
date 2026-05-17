import { useState, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw, Loader2, X, Plus } from 'lucide-react';
import { financialApi } from '../api/financialApi';
import toast from 'react-hot-toast';

export default function GmailConnect({ onConnected }) {
  const [accounts,  setAccounts]  = useState(null); // null = loading
  const [syncing,   setSyncing]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    financialApi.getGmailAccounts()
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
  }, []);

  const handleConnect = async () => {
    try {
      const { authUrl } = await financialApi.connectGmail();
      const popup = window.open(authUrl, 'gmail-oauth', 'width=500,height=600,top=100,left=100');
      const poll = setInterval(() => {
        if (popup?.closed) {
          clearInterval(poll);
          financialApi.getGmailAccounts()
            .then((data) => {
              const updated = Array.isArray(data) ? data : [];
              setAccounts(updated);
              if (updated.length > (accounts?.length ?? 0)) {
                toast.success('Gmail account connected! Syncing transactions…');
                handleSync();
                onConnected?.();
              }
            });
        }
      }, 800);
    } catch {
      toast.error('Could not initiate Gmail connection. Please try again.');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await financialApi.syncGmail();
      const total = Array.isArray(result?.results)
        ? result.results.reduce((sum, r) => sum + (r.imported ?? 0), 0)
        : (result?.imported ?? 0);
      toast.success(`Synced ${total} new transactions`);
      onConnected?.();
    } catch {
      toast.error('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (accounts === null || dismissed) return null;

  const count = accounts.length;

  if (count > 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">
            {count} Gmail account{count !== 1 ? 's' : ''} connected — transactions sync automatically
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline disabled:opacity-50"
          >
            {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Sync all
          </button>
          <button
            onClick={handleConnect}
            disabled={syncing}
            className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline disabled:opacity-50"
          >
            <Plus size={12} /> Add account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50 p-4 mb-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
      >
        <X size={14} />
      </button>
      <div className="flex gap-3 items-start pr-4">
        <div className="w-9 h-9 rounded-xl bg-white border border-primary-200 flex items-center justify-center flex-shrink-0">
          <Mail size={17} className="text-primary-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800 mb-0.5">Connect Gmail for automatic tracking</p>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Allow one-time read access to your Gmail so we can automatically detect and import bank transactions — no CSV uploads, no manual entry.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleConnect} className="btn-primary btn-sm">
              <Mail size={13} /> Connect Gmail
            </button>
            <button onClick={() => setDismissed(true)} className="btn-outline btn-sm text-xs text-slate-500">
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
