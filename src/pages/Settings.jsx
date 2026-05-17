import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Plus, RefreshCw, Pencil, Trash2, Loader2, CheckCircle, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common';
import { financialApi } from '../modules/financial-advisor/api/financialApi';

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AccountRow({ account, onSync, onResync, onDisconnect, onLabelSave }) {
  const [editing,       setEditing]       = useState(false);
  const [label,         setLabel]         = useState(account.label ?? '');
  const [saving,        setSaving]        = useState(false);
  const [syncing,       setSyncing]       = useState(false);
  const [resyncing,     setResyncing]     = useState(false);
  const [confirming,    setConfirming]    = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleSaveLabel = async () => {
    setSaving(true);
    try {
      await onLabelSave(account.id, label.trim() || account.gmailEmail);
      setEditing(false);
    } catch {
      // onLabelSave shows the toast
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try { await onSync(account.id); } finally { setSyncing(false); }
  };

  const handleResync = async () => {
    if (!window.confirm('This will delete all imported transactions from this account and re-import them with improved parsing. Continue?')) return;
    setResyncing(true);
    try { await onResync(account.id); } finally { setResyncing(false); }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try { await onDisconnect(account.id); } finally { setDisconnecting(false); setConfirming(false); }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-slate-100 last:border-0">
      {/* Icon + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
          <Mail size={16} className="text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel()}
                className="text-sm border border-slate-300 rounded-lg px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button onClick={handleSaveLabel} disabled={saving} className="btn-primary btn-sm">
                {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
              </button>
              <button onClick={() => { setLabel(account.label ?? ''); setEditing(false); }} className="btn-outline btn-sm">
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-800 truncate">
              {account.label || account.gmailEmail}
            </p>
          )}
          <p className="text-xs text-slate-500 truncate">{account.gmailEmail}</p>
          <p className="text-xs text-slate-400 mt-0.5">Last synced: {formatRelativeTime(account.lastSyncedAt)}</p>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {account.isConnected ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <CheckCircle size={11} /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            <AlertCircle size={11} /> Disconnected
          </span>
        )}
      </div>

      {/* Actions */}
      {!confirming ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSync}
            disabled={syncing || resyncing || disconnecting}
            className="btn-outline btn-sm"
          >
            {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Sync
          </button>
          <button
            onClick={handleResync}
            disabled={syncing || resyncing || disconnecting}
            className="inline-flex items-center gap-1 btn-sm border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {resyncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Re-sync
          </button>
          <button
            onClick={() => setEditing(true)}
            disabled={syncing || resyncing || disconnecting}
            className="btn-outline btn-sm"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setConfirming(true)}
            disabled={syncing || resyncing || disconnecting}
            className="inline-flex items-center gap-1 btn-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-shrink-0">
          <p className="text-xs text-slate-600 font-medium">Disconnect?</p>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="inline-flex items-center gap-1 btn-sm bg-red-600 text-white hover:bg-red-700 border border-red-600 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
          >
            {disconnecting ? <Loader2 size={12} className="animate-spin" /> : 'Yes'}
          </button>
          <button onClick={() => setConfirming(false)} className="btn-outline btn-sm">No</button>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const [accounts,   setAccounts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await financialApi.getGmailAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load Gmail accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { authUrl } = await financialApi.connectGmail();
      const popup = window.open(authUrl, 'gmail-oauth', 'width=500,height=600,top=100,left=100');
      const poll = setInterval(() => {
        if (popup?.closed) {
          clearInterval(poll);
          setConnecting(false);
          fetchAccounts();
          toast.success('Gmail account connected!');
        }
      }, 800);
    } catch {
      toast.error('Could not initiate Gmail connection. Please try again.');
      setConnecting(false);
    }
  };

  const handleSync = async (id) => {
    try {
      const result = await financialApi.syncGmailAccount(id);
      toast.success(`Synced ${result.imported ?? 0} new transactions`);
      fetchAccounts();
    } catch {
      toast.error('Sync failed. Please try again.');
    }
  };

  const handleResync = async (id) => {
    try {
      const result = await financialApi.resyncGmailAccount(id);
      toast.success(`Re-synced ${result.imported ?? 0} transactions`);
      fetchAccounts();
    } catch {
      toast.error('Re-sync failed. Please try again.');
    }
  };

  const handleDisconnect = async (id) => {
    try {
      await financialApi.disconnectGmailAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Account disconnected');
    } catch {
      toast.error('Failed to disconnect account');
    }
  };

  const handleLabelSave = async (id, label) => {
    try {
      await financialApi.updateGmailAccount(id, { label });
      setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, label } : a)));
      toast.success('Label updated');
    } catch {
      toast.error('Failed to update label');
      throw new Error('label save failed');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your account and integration preferences" />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Connected Gmail Accounts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Transactions are automatically imported from these accounts
              </p>
            </div>
            {accounts.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                {accounts.length} account{accounts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Loading accounts…</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Mail size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">No Gmail accounts connected</p>
              <p className="text-xs text-slate-500">
                Connect a Gmail account to automatically track your bank transactions
              </p>
            </div>
          ) : (
            <div>
              {accounts.map((account) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  onSync={handleSync}
                  onResync={handleResync}
                  onDisconnect={handleDisconnect}
                  onLabelSave={handleLabelSave}
                />
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="btn-primary btn-sm"
            >
              {connecting ? (
                <><Loader2 size={14} className="animate-spin" /> Connecting…</>
              ) : (
                <><Plus size={14} /> Connect{accounts.length > 0 ? ' Another' : ''} Gmail Account</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
