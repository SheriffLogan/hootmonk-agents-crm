import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HandCoins, ArrowUpRight, ArrowDownLeft, Wallet,
  Plane, PiggyBank, TrendingUp, CircleDot,
  Plus, X, Pencil, Trash2, Loader2, Calendar, Clock,
} from 'lucide-react';
import { PageHeader, MetricCard } from '../../components/common';
import { financialApi } from './api/financialApi';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import dayjs from 'dayjs';

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

// ─── Constants ────────────────────────────────────────────────────────────────

const LEDGER_STATUS = {
  pending:    { label: 'Pending',     dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
  partial:    { label: 'Partial',     dot: 'bg-blue-400',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
  settled:    { label: 'Settled',     dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  written_off:{ label: 'Written Off', dot: 'bg-red-400',     text: 'text-red-700',     bg: 'bg-red-50'     },
};

const ALLOC_CATEGORIES = {
  BIG_TRAVEL:   { label: 'Big Travel',   Icon: Plane,      bg: 'bg-sky-50',     text: 'text-sky-700'     },
  SMALL_TRAVEL: { label: 'Small Travel', Icon: Plane,      bg: 'bg-cyan-50',    text: 'text-cyan-700'    },
  SAVINGS:      { label: 'Savings',      Icon: PiggyBank,  bg: 'bg-emerald-50', text: 'text-emerald-700' },
  INVESTMENT:   { label: 'Investment',   Icon: TrendingUp, bg: 'bg-violet-50',  text: 'text-violet-700'  },
};

const ALLOC_STATUS = {
  active:    { label: 'Active',    text: 'text-emerald-700', bg: 'bg-emerald-50' },
  used:      { label: 'Used',      text: 'text-slate-700',   bg: 'bg-slate-100'  },
  cancelled: { label: 'Cancelled', text: 'text-red-700',     bg: 'bg-red-50'     },
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatusBadge({ status, map }) {
  const key = status != null && status in map ? status : (status ?? '').toLowerCase();
  const s = map[key] ?? map[Object.keys(map)[0]];
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full', s.bg, s.text)}>
      {'dot' in s && <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', s.dot)} />}
      {s.label}
    </span>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Ledger card ──────────────────────────────────────────────────────────────

function LedgerCard({ entry, onEdit, onPayment, onAddMore, onSettle, onWriteOff, onDelete }) {
  const isLent      = entry.direction === 'LENT';
  const settled     = Number(entry.settledAmount ?? 0);
  const amount      = Number(entry.amount);
  const pct         = amount > 0 ? Math.min(100, Math.round((settled / amount) * 100)) : 0;
  const statusLower = (entry.status ?? '').toLowerCase();
  const canAct      = statusLower !== 'settled' && statusLower !== 'written_off';

  const [showHistory, setShowHistory] = useState(false);
  const [history,     setHistory]     = useState(null);
  const [histLoading, setHistLoading] = useState(false);

  // Invalidate history cache when entry data mutates
  useEffect(() => {
    setHistory(null);
  }, [entry.amount, entry.settledAmount, entry.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleHistory = async () => {
    if (!showHistory && history === null) {
      setHistLoading(true);
      try {
        const data = await financialApi.getLedgerHistory(entry.id);
        setHistory(Array.isArray(data) ? data : (data?.data ?? []));
      } catch {
        toast.error('Failed to load history');
        setHistory([]);
      } finally {
        setHistLoading(false);
      }
    }
    setShowHistory((v) => !v);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              isLent ? 'bg-red-50' : 'bg-emerald-50',
            )}>
              {isLent
                ? <ArrowUpRight size={16} className="text-red-500" />
                : <ArrowDownLeft size={16} className="text-emerald-500" />
              }
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{entry.contactName}</p>
              {entry.contactPhone && <p className="text-xs text-slate-400">{entry.contactPhone}</p>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={clsx('text-lg font-bold',
              isLent && statusLower !== 'settled' ? 'text-red-600' : 'text-emerald-600',
            )}>
              {INR.format(amount)}
            </p>
            <p className="text-xs text-slate-400">{isLent ? 'Lent' : 'Borrowed'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={statusLower} map={LEDGER_STATUS} />
          {entry.dueDate && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={11} /> Due {dayjs(entry.dueDate).format('DD MMM YYYY')}
            </span>
          )}
        </div>

        {settled > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{isLent ? 'Received' : 'Repaid'}: {INR.format(settled)}</span>
              <span>{pct}% of {INR.format(amount)}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {entry.notes && <p className="text-xs text-slate-500 italic">{entry.notes}</p>}

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {/* Always visible — even on settled entries */}
          <button
            onClick={() => onAddMore(entry)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          >
            {isLent ? 'Lend More' : 'Borrow More'}
          </button>
          {canAct && (
            <>
              <button
                onClick={() => onPayment(entry)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {isLent ? 'Received Back' : 'Paid Back'}
              </button>
              <button
                onClick={() => onSettle(entry)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Settle
              </button>
              <button
                onClick={() => onWriteOff(entry)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Write Off
              </button>
            </>
          )}
          <div className="ml-auto flex gap-1">
            <button
              onClick={toggleHistory}
              title="View history"
              className={clsx('btn-ghost p-1.5 rounded-lg transition-colors', showHistory ? 'text-primary-600' : '')}
            >
              <Clock size={12} />
            </button>
            <button onClick={() => onEdit(entry)} className="btn-ghost p-1.5 rounded-lg"><Pencil size={12} /></button>
            <button onClick={() => onDelete(entry.id)} className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
          </div>
        </div>
      </div>

      {/* ── Inline history panel ── */}
      {showHistory && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">History</p>
          {histLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 size={14} className="animate-spin text-slate-400" />
            </div>
          ) : !history || history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-1">No history recorded yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <span className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 inline-block',
                    h.type === 'payment' ? 'bg-emerald-400' : 'bg-blue-400',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={clsx('font-semibold',
                        h.type === 'payment' ? 'text-emerald-600' : 'text-blue-600',
                      )}>
                        {h.type === 'payment' ? '↓ ' : '↑ '}{INR.format(h.amount)}
                      </span>
                      <span className="text-slate-400 flex-shrink-0">
                        {dayjs(h.date ?? h.createdAt).format('DD MMM YYYY')}
                      </span>
                    </div>
                    {h.note && <p className="text-slate-500 mt-0.5 truncate">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Allocation card ──────────────────────────────────────────────────────────

function AllocationCard({ alloc, onEdit, onTopUp, onMarkUsed, onCancel, onDelete }) {
  const cat      = ALLOC_CATEGORIES[alloc.category] ?? ALLOC_CATEGORIES.SAVINGS;
  const { Icon } = cat;
  const allocated = Number(alloc.allocatedAmount ?? 0);
  const target    = Number(alloc.targetAmount);
  const pct       = target > 0 ? Math.min(100, Math.round((allocated / target) * 100)) : 0;
  const isActive  = (alloc.status ?? 'active').toLowerCase() === 'active';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', cat.bg)}>
            <Icon size={16} className={cat.text} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">{alloc.name}</p>
            <div className="flex gap-1.5 mt-0.5 flex-wrap">
              <span className={clsx('text-xs font-medium px-1.5 py-0.5 rounded', cat.bg, cat.text)}>{cat.label}</span>
              {alloc.investmentType && (
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-700">{alloc.investmentType}</span>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={alloc.status ?? 'active'} map={ALLOC_STATUS} />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{INR.format(allocated)} allocated</span>
          <span>{pct}% of {INR.format(target)}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', pct >= 100 ? 'bg-emerald-500' : 'bg-primary-500')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {alloc.deadline && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar size={11} /> Deadline: {dayjs(alloc.deadline).format('DD MMM YYYY')}
        </p>
      )}

      {alloc.notes && <p className="text-xs text-slate-500 italic">{alloc.notes}</p>}

      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        {isActive && (
          <>
            <button
              onClick={() => onTopUp(alloc)}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Top Up
            </button>
            <button
              onClick={() => onMarkUsed(alloc.id)}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              Mark Used
            </button>
            <button
              onClick={() => onCancel(alloc.id)}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
        <div className="ml-auto flex gap-1">
          <button onClick={() => onEdit(alloc)} className="btn-ghost p-1.5 rounded-lg"><Pencil size={12} /></button>
          <button onClick={() => onDelete(alloc.id)} className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

// Generic confirm with optional note — onConfirm(note) is async; throws on error
function ConfirmModal({ title, message, confirmLabel, danger = false, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [note,    setNote]    = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(note || undefined);
      onClose();
    } catch {
      // error toast handled by onConfirm
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      {message && <p className="text-sm text-slate-600 mb-4">{message}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Note <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Settled via bank transfer"
            className="input resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className={clsx('flex-1 inline-flex items-center justify-center gap-1.5 font-medium text-sm rounded-lg px-4 py-2 transition-colors',
              danger
                ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50',
            )}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function LedgerModal({ entry, onClose, onSuccess }) {
  const isEdit  = !!entry;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contactName:  entry?.contactName  ?? '',
    contactPhone: entry?.contactPhone ?? '',
    amount:       entry?.amount       ?? '',
    direction:    entry?.direction    ?? 'LENT',
    dueDate:      entry?.dueDate?.split('T')[0] ?? '',
    notes:        entry?.notes        ?? '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.contactName.trim()) return toast.error('Contact name is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      const body = { ...form, amount: Number(form.amount), dueDate: form.dueDate || null };
      const result = isEdit
        ? await financialApi.updateLedgerEntry(entry.id, body)
        : await financialApi.createLedgerEntry(body);
      toast.success(isEdit ? 'Entry updated' : 'Entry added');
      onSuccess(result, isEdit, body);
    } catch {
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={isEdit ? 'Edit Ledger Entry' : 'Add Ledger Entry'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Contact Name</label>
          <input
            value={form.contactName}
            onChange={(e) => set('contactName', e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Contact Phone <span className="text-slate-400 font-normal">(optional)</span></label>
          <input
            value={form.contactPhone}
            onChange={(e) => set('contactPhone', e.target.value)}
            placeholder="+91 98765 43210"
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount (₹)</label>
            <input
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              type="number" min="1" step="1"
              placeholder="5000"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Direction</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden h-[38px]">
              {[{ val: 'LENT', label: 'Lent' }, { val: 'BORROWED', label: 'Borrowed' }].map(({ val, label }) => (
                <button
                  key={val} type="button"
                  onClick={() => set('direction', val)}
                  className={clsx(
                    'flex-1 text-xs font-medium transition-colors',
                    form.direction === val
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="label">Due Date <span className="text-slate-400 font-normal">(optional)</span></label>
          <input
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            type="date"
            className="input"
          />
        </div>
        <div>
          <label className="label">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any additional context"
            className="input resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Entry'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function PaymentModal({ entry, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount]   = useState('');
  const [note,   setNote]     = useState('');
  const isLent    = entry.direction === 'LENT';
  const remaining = Number(entry.amount) - Number(entry.settledAmount ?? 0);

  const submit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      await financialApi.recordLedgerPayment(entry.id, { amount: numAmount, note: note || undefined });
      toast.success('Payment recorded');
      onSuccess(entry.id, numAmount);
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={`Record ${isLent ? 'Receipt' : 'Repayment'}`} onClose={onClose}>
      <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm space-y-0.5">
        <p className="font-bold text-slate-900">{entry.contactName}</p>
        <p className="text-slate-500">Total: {INR.format(Number(entry.amount))}</p>
        {Number(entry.settledAmount ?? 0) > 0 && (
          <p className="text-xs text-slate-400">
            Already {isLent ? 'received' : 'repaid'}: {INR.format(Number(entry.settledAmount))}
          </p>
        )}
        <p className="text-xs font-medium text-primary-600">Remaining: {INR.format(remaining)}</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Amount (₹)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number" min="1" max={remaining} step="1"
            placeholder={`Max ${INR.format(remaining)}`}
            className="input"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="label">Note <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. UPI transfer, Cash"
            className="input resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : isLent ? 'Record Receipt' : 'Record Repayment'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddMoreModal({ entry, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [extra, setExtra]     = useState('');
  const [note,  setNote]      = useState('');
  const isLent    = entry.direction === 'LENT';
  const curAmount = Number(entry.amount); // explicit cast — backend may return string

  const submit = async (e) => {
    e.preventDefault();
    const numExtra = Number(extra);
    if (!extra || numExtra <= 0) return toast.error('Enter a valid amount');
    const newAmount = curAmount + numExtra;
    setLoading(true);
    try {
      await financialApi.updateLedgerEntry(entry.id, { amount: newAmount, note: note || undefined });
      toast.success(`${isLent ? 'Lent' : 'Borrowed'} amount updated`);
      onSuccess(entry.id, newAmount);
    } catch {
      toast.error('Failed to update amount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={isLent ? 'Lend More' : 'Borrow More'} onClose={onClose}>
      <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm space-y-0.5">
        <p className="font-bold text-slate-900">{entry.contactName}</p>
        <p className="text-slate-500">Current amount: {INR.format(curAmount)}</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Additional Amount (₹)</label>
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            type="number" min="1" step="1"
            placeholder="e.g. 2000"
            className="input"
            autoFocus
            required
          />
          {extra && Number(extra) > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              New total: {INR.format(curAmount + Number(extra))}
            </p>
          )}
        </div>
        <div>
          <label className="label">Note <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Additional loan for medical expenses"
            className="input resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : isLent ? 'Lend More' : 'Borrow More'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AllocationModal({ alloc, onClose, onSuccess }) {
  const isEdit  = !!alloc;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:           alloc?.name           ?? '',
    category:       alloc?.category       ?? 'SAVINGS',
    investmentType: alloc?.investmentType ?? '',
    targetAmount:   alloc?.targetAmount   ?? '',
    initialAmount:  alloc?.allocatedAmount ?? '',
    deadline:       alloc?.deadline?.split('T')[0] ?? '',
    notes:          alloc?.notes          ?? '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.targetAmount || Number(form.targetAmount) <= 0) return toast.error('Enter a valid target amount');
    setLoading(true);
    try {
      const body = {
        ...form,
        targetAmount:  Number(form.targetAmount),
        initialAmount: Number(form.initialAmount) || 0,
      };
      const result = isEdit
        ? await financialApi.updateAllocation(alloc.id, body)
        : await financialApi.createAllocation(body);
      toast.success(isEdit ? 'Allocation updated' : 'Allocation created');
      onSuccess(result, isEdit, body);
    } catch {
      toast.error('Failed to save allocation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={isEdit ? 'Edit Allocation' : 'New Allocation'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Goa Trip, Emergency Fund"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
            {Object.entries(ALLOC_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {form.category === 'INVESTMENT' && (
          <div>
            <label className="label">Investment Type</label>
            <select value={form.investmentType} onChange={(e) => set('investmentType', e.target.value)} className="input">
              <option value="">Select type</option>
              <option value="Mutual Fund">Mutual Fund</option>
              <option value="Stocks">Stocks</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
              <option value="PPF">PPF</option>
              <option value="NPS">NPS</option>
              <option value="Gold">Gold</option>
              <option value="Other">Other</option>
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target Amount (₹)</label>
            <input
              value={form.targetAmount}
              onChange={(e) => set('targetAmount', e.target.value)}
              type="number" min="1" step="100"
              placeholder="50000"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">{isEdit ? 'Allocated (₹)' : 'Initial Amount (₹)'}</label>
            <input
              value={form.initialAmount}
              onChange={(e) => set('initialAmount', e.target.value)}
              type="number" min="0" step="100"
              placeholder="0"
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label">Deadline <span className="text-slate-400 font-normal">(optional)</span></label>
          <input
            value={form.deadline}
            onChange={(e) => set('deadline', e.target.value)}
            type="date"
            className="input"
          />
        </div>
        <div>
          <label className="label">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any notes"
            className="input resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function TopUpModal({ alloc, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount]   = useState('');
  const [note,   setNote]     = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      await financialApi.topUpAllocation(alloc.id, { amount: numAmount, note: note || undefined });
      toast.success('Topped up successfully');
      onSuccess(alloc.id, numAmount);
    } catch {
      toast.error('Failed to top up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title={`Top Up — ${alloc.name}`} onClose={onClose}>
      <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm space-y-0.5">
        <p className="text-slate-500 text-xs">Current allocation</p>
        <p className="font-bold text-slate-900">
          {INR.format(Number(alloc.allocatedAmount ?? 0))} / {INR.format(Number(alloc.targetAmount))}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Top-Up Amount (₹)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number" min="1" step="100"
            placeholder="5000"
            className="input"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="label">Note <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Monthly contribution"
            className="input resize-none"
            rows={2}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : 'Top Up'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Filter pill row ──────────────────────────────────────────────────────────

function FilterPills({ options, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={clsx(
            'text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
            active === o.key
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FALedger() {
  const [activeTab, setActiveTab] = useState('ledger');

  // ── Ledger state ────────────────────────────────────────────────────────────
  const [ledgerFilter,    setLedgerFilter]    = useState('all');
  const [ledgerEntries,   setLedgerEntries]   = useState([]);
  const [ledgerLoading,   setLedgerLoading]   = useState(true);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [editLedger,      setEditLedger]      = useState(null);
  const [paymentEntry,    setPaymentEntry]    = useState(null);
  const [addMoreEntry,    setAddMoreEntry]    = useState(null);
  const [confirmSettle,   setConfirmSettle]   = useState(null); // full entry
  const [confirmWriteOff, setConfirmWriteOff] = useState(null); // full entry

  // ── Allocations state ───────────────────────────────────────────────────────
  const [catFilter,      setCatFilter]      = useState('all');
  const [allocations,    setAllocations]    = useState([]);
  const [allocLoading,   setAllocLoading]   = useState(true);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [editAlloc,      setEditAlloc]      = useState(null);
  const [topUpAlloc,     setTopUpAlloc]     = useState(null);

  // ── Computed summaries (no separate API calls) ──────────────────────────────
  const ledgerSummary = useMemo(() => {
    const active = ledgerEntries.filter(e => (e.status ?? '').toLowerCase() !== 'written_off');
    return {
      totalLent:     active.filter(e => e.direction === 'LENT').reduce((s, e) => s + Number(e.amount), 0),
      totalBorrowed: active.filter(e => e.direction === 'BORROWED').reduce((s, e) => s + Number(e.amount), 0),
    };
  }, [ledgerEntries]);

  const allocSummary = useMemo(() => ({
    totalAllocated: allocations.reduce((s, a) => s + Number(a.allocatedAmount ?? 0), 0),
    byCategory: Object.fromEntries(
      Object.keys(ALLOC_CATEGORIES).map(k => [
        k,
        allocations.filter(a => a.category === k).reduce((s, a) => s + Number(a.allocatedAmount ?? 0), 0),
      ])
    ),
  }), [allocations]);

  // ── Optimistic state helpers ────────────────────────────────────────────────
  const patchLedger  = (id, patch) => setLedgerEntries(p => p.map(e => e.id === id ? { ...e, ...patch } : e));
  const removeLedger = (id)        => setLedgerEntries(p => p.filter(e => e.id !== id));
  const patchAlloc   = (id, patch) => setAllocations(p => p.map(a => a.id === id ? { ...a, ...patch } : a));
  const removeAlloc  = (id)        => setAllocations(p => p.filter(a => a.id !== id));

  // ── Data fetchers (initial load only) ──────────────────────────────────────
  const fetchLedger = useCallback(async () => {
    setLedgerLoading(true);
    try {
      const entries = await financialApi.getLedgerEntries();
      setLedgerEntries(Array.isArray(entries) ? entries : (entries?.data ?? []));
    } catch {
      toast.error('Failed to load ledger');
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  const fetchAllocations = useCallback(async () => {
    setAllocLoading(true);
    try {
      const allocs = await financialApi.getAllocations();
      setAllocations(Array.isArray(allocs) ? allocs : (allocs?.data ?? []));
    } catch {
      toast.error('Failed to load allocations');
    } finally {
      setAllocLoading(false);
    }
  }, []);

  useEffect(() => { fetchLedger(); },      [fetchLedger]);
  useEffect(() => { fetchAllocations(); }, [fetchAllocations]);

  // ── Ledger modal callbacks ──────────────────────────────────────────────────
  const handleLedgerSaved = (result, wasEdit, formBody) => {
    if (wasEdit) {
      // Use API response if it looks like a full entry; else patch from form data
      patchLedger(editLedger.id, result?.id ? result : { ...formBody, id: editLedger.id });
    } else {
      const newEntry = result?.id
        ? result
        : { ...formBody, id: result?.id ?? `tmp_${Date.now()}`, settledAmount: 0, status: 'PENDING' };
      setLedgerEntries(p => [newEntry, ...p]);
    }
    setShowLedgerModal(false);
    setEditLedger(null);
  };

  const handlePaymentDone = (id, paidAmount) => {
    setLedgerEntries(p => p.map(e => {
      if (e.id !== id) return e;
      const newSettled = Number(e.settledAmount ?? 0) + paidAmount;
      const newStatus  = newSettled >= Number(e.amount) ? 'SETTLED' : 'PARTIAL';
      return { ...e, settledAmount: newSettled, status: newStatus };
    }));
    setPaymentEntry(null);
  };

  const handleAddMoreDone = (id, newAmount) => {
    patchLedger(id, { amount: newAmount });
    setAddMoreEntry(null);
  };

  const handleDeleteLedger = async (id) => {
    try {
      await financialApi.deleteLedgerEntry(id);
      removeLedger(id);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  // ── Allocation modal callbacks ──────────────────────────────────────────────
  const handleAllocSaved = (result, wasEdit, formBody) => {
    if (wasEdit) {
      patchAlloc(editAlloc.id, result?.id ? result : { ...formBody, id: editAlloc.id });
    } else {
      const newAlloc = result?.id
        ? result
        : { ...formBody, id: result?.id ?? `tmp_${Date.now()}`, allocatedAmount: formBody.initialAmount ?? 0, status: 'active' };
      setAllocations(p => [newAlloc, ...p]);
    }
    setShowAllocModal(false);
    setEditAlloc(null);
  };

  const handleTopUpDone = (id, topUpAmount) => {
    patchAlloc(id, {
      allocatedAmount: Number(allocations.find(a => a.id === id)?.allocatedAmount ?? 0) + topUpAmount,
    });
    setTopUpAlloc(null);
  };

  const handleMarkUsed = async (id) => {
    try {
      await financialApi.markAllocationUsed(id);
      patchAlloc(id, { status: 'USED' });
      toast.success('Marked as used');
    } catch { toast.error('Failed to update status'); }
  };

  const handleCancelAlloc = async (id) => {
    try {
      await financialApi.cancelAllocation(id);
      patchAlloc(id, { status: 'CANCELLED' });
      toast.success('Allocation cancelled');
    } catch { toast.error('Failed to cancel'); }
  };

  const handleDeleteAlloc = async (id) => {
    try {
      await financialApi.deleteAllocation(id);
      removeAlloc(id);
      toast.success('Allocation deleted');
    } catch { toast.error('Failed to delete'); }
  };

  // ── Filtered views ──────────────────────────────────────────────────────────
  const filteredLedger = ledgerEntries.filter((e) => {
    if (ledgerFilter === 'lent')     return e.direction === 'LENT';
    if (ledgerFilter === 'borrowed') return e.direction === 'BORROWED';
    if (ledgerFilter === 'settled')  return (e.status ?? '').toLowerCase() === 'settled';
    return true;
  });

  const filteredAllocs = allocations.filter((a) =>
    catFilter === 'all' || a.category === catFilter,
  );

  const netOwed = ledgerSummary.totalLent - ledgerSummary.totalBorrowed;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Ledger & Allocations"
        subtitle="Track lending, borrowing and fund allocations"
        actions={
          <button
            onClick={() => {
              if (activeTab === 'ledger') {
                setEditLedger(null);
                setShowLedgerModal(true);
              } else {
                setEditAlloc(null);
                setShowAllocModal(true);
              }
            }}
            className="btn-primary btn-sm"
          >
            <Plus size={13} /> {activeTab === 'ledger' ? 'Add Entry' : 'Add Allocation'}
          </button>
        }
      />

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit">
        {[
          { key: 'ledger',      label: 'Ledger'      },
          { key: 'allocations', label: 'Allocations' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={clsx(
              'text-sm font-medium px-4 py-1.5 rounded-lg transition-all',
              activeTab === t.key
                ? 'bg-white text-slate-800 shadow-card'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Ledger tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Total Lent Out"
              value={INR.format(ledgerSummary.totalLent)}
              icon={<ArrowUpRight size={18} />}
              iconBg="bg-red-50"
              iconColor="text-red-500"
              loading={ledgerLoading}
            />
            <MetricCard
              title="Total Borrowed"
              value={INR.format(ledgerSummary.totalBorrowed)}
              icon={<ArrowDownLeft size={18} />}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              loading={ledgerLoading}
            />
            <MetricCard
              title="Net Owed to You"
              value={INR.format(Math.abs(netOwed))}
              subtitle={netOwed >= 0 ? 'You are owed' : 'You owe others'}
              icon={<Wallet size={18} />}
              iconBg={netOwed >= 0 ? 'bg-primary-50' : 'bg-amber-50'}
              iconColor={netOwed >= 0 ? 'text-primary-600' : 'text-amber-600'}
              loading={ledgerLoading}
            />
          </div>

          <FilterPills
            options={[
              { key: 'all',      label: 'All'      },
              { key: 'lent',     label: 'Lent'     },
              { key: 'borrowed', label: 'Borrowed' },
              { key: 'settled',  label: 'Settled'  },
            ]}
            active={ledgerFilter}
            onChange={setLedgerFilter}
          />

          {ledgerLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : filteredLedger.length === 0 ? (
            <div className="text-center py-12">
              <HandCoins size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm font-medium">No entries found</p>
              <p className="text-slate-400 text-xs mt-1">Add your first lending or borrowing record.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLedger.map((entry) => (
                <LedgerCard
                  key={entry.id}
                  entry={entry}
                  onEdit={(e) => { setEditLedger(e); setShowLedgerModal(true); }}
                  onPayment={setPaymentEntry}
                  onAddMore={setAddMoreEntry}
                  onSettle={setConfirmSettle}
                  onWriteOff={setConfirmWriteOff}
                  onDelete={handleDeleteLedger}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Allocations tab ─────────────────────────────────────────────────── */}
      {activeTab === 'allocations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Total Allocated"
              value={INR.format(allocSummary.totalAllocated)}
              icon={<Wallet size={18} />}
              iconBg="bg-primary-50"
              iconColor="text-primary-600"
              loading={allocLoading}
            />
            {Object.entries(ALLOC_CATEGORIES).map(([key, cat]) => {
              const { Icon } = cat;
              return (
                <MetricCard
                  key={key}
                  title={cat.label}
                  value={INR.format(allocSummary.byCategory[key] ?? 0)}
                  icon={<Icon size={18} />}
                  iconBg={cat.bg}
                  iconColor={cat.text}
                  loading={allocLoading}
                />
              );
            })}
          </div>

          <FilterPills
            options={[
              { key: 'all', label: 'All' },
              ...Object.entries(ALLOC_CATEGORIES).map(([k, v]) => ({ key: k, label: v.label })),
            ]}
            active={catFilter}
            onChange={setCatFilter}
          />

          {allocLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : filteredAllocs.length === 0 ? (
            <div className="text-center py-12">
              <CircleDot size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm font-medium">No allocations found</p>
              <p className="text-slate-400 text-xs mt-1">Create one to start tracking your fund allocations.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAllocs.map((alloc) => (
                <AllocationCard
                  key={alloc.id}
                  alloc={alloc}
                  onEdit={(a) => { setEditAlloc(a); setShowAllocModal(true); }}
                  onTopUp={setTopUpAlloc}
                  onMarkUsed={handleMarkUsed}
                  onCancel={handleCancelAlloc}
                  onDelete={handleDeleteAlloc}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}
      {showLedgerModal && (
        <LedgerModal
          entry={editLedger}
          onClose={() => { setShowLedgerModal(false); setEditLedger(null); }}
          onSuccess={handleLedgerSaved}
        />
      )}
      {paymentEntry && (
        <PaymentModal
          entry={paymentEntry}
          onClose={() => setPaymentEntry(null)}
          onSuccess={handlePaymentDone}
        />
      )}
      {addMoreEntry && (
        <AddMoreModal
          entry={addMoreEntry}
          onClose={() => setAddMoreEntry(null)}
          onSuccess={handleAddMoreDone}
        />
      )}
      {confirmSettle && (
        <ConfirmModal
          title="Settle Entry"
          message={`Mark ${confirmSettle.contactName}'s entry as fully settled?`}
          confirmLabel="Settle"
          onClose={() => setConfirmSettle(null)}
          onConfirm={async (note) => {
            try {
              await financialApi.settleLedgerEntry(confirmSettle.id, { note });
              patchLedger(confirmSettle.id, { status: 'SETTLED' });
              toast.success('Entry settled');
              setConfirmSettle(null);
            } catch {
              toast.error('Failed to settle');
              throw new Error();
            }
          }}
        />
      )}
      {confirmWriteOff && (
        <ConfirmModal
          title="Write Off Entry"
          message={`Write off ${confirmWriteOff.contactName}'s entry? This cannot be undone.`}
          confirmLabel="Write Off"
          danger
          onClose={() => setConfirmWriteOff(null)}
          onConfirm={async (note) => {
            try {
              await financialApi.writeOffLedgerEntry(confirmWriteOff.id, { note });
              patchLedger(confirmWriteOff.id, { status: 'WRITTEN_OFF' });
              toast.success('Entry written off');
              setConfirmWriteOff(null);
            } catch {
              toast.error('Failed to write off');
              throw new Error();
            }
          }}
        />
      )}
      {showAllocModal && (
        <AllocationModal
          alloc={editAlloc}
          onClose={() => { setShowAllocModal(false); setEditAlloc(null); }}
          onSuccess={handleAllocSaved}
        />
      )}
      {topUpAlloc && (
        <TopUpModal
          alloc={topUpAlloc}
          onClose={() => setTopUpAlloc(null)}
          onSuccess={handleTopUpDone}
        />
      )}
    </div>
  );
}
