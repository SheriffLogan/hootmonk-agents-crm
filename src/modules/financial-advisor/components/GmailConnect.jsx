/**
 * GmailConnect — one-time Gmail OAuth connection banner.
 * Shows when gmail is not connected. Disappears once connected.
 */
import { useState, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw, Loader2, X } from 'lucide-react';
import { financialApi } from '../api/financialApi';
import toast from 'react-hot-toast';

export default function GmailConnect({ onConnected }) {
  const [status,   setStatus]   = useState(null); // null | 'connected' | 'disconnected'
  const [syncing,  setSyncing]  = useState(false);
  const [dismissed,setDismissed]= useState(false);

  useEffect(() => {
    financialApi.getGmailStatus()
      .then((r) => setStatus(r.connected ? 'connected' : 'disconnected'))
      .catch(()  => setStatus('disconnected'));
  }, []);

  const handleConnect = async () => {
    try {
      const { authUrl } = await financialApi.connectGmail();
      // Open Google OAuth in a popup
      const popup = window.open(authUrl, 'gmail-oauth', 'width=500,height=600,top=100,left=100');
      // Poll for popup close → then re-check status
      const poll = setInterval(() => {
        if (popup?.closed) {
          clearInterval(poll);
          financialApi.getGmailStatus()
            .then((r) => {
              if (r.connected) {
                setStatus('connected');
                toast.success('Gmail connected! Syncing your transactions…');
                handleSync();
                onConnected?.();
              }
            });
        }
      }, 800);
    } catch (_) {
      toast.error('Could not initiate Gmail connection. Please try again.');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await financialApi.syncGmail();
      toast.success(`Synced ${result.imported ?? 0} new transactions`);
      onConnected?.();
    } catch (_) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (status === null || dismissed) return null;

  if (status === 'connected') {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">Gmail connected — transactions sync automatically</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline disabled:opacity-50"
        >
          {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Sync now
        </button>
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
            <button
              onClick={() => setDismissed(true)}
              className="btn-outline btn-sm text-xs text-slate-500"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
