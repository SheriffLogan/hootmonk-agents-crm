/**
 * AddTransactionModal — quick-add form for manual transactions.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { financialApi } from '../api/financialApi';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Food & Dining','Shopping','Transport','Utilities',
  'Entertainment','Healthcare','Investment','Salary','Other',
];

const schema = z.object({
  description: z.string().min(2, 'Description required'),
  amount:      z.coerce.number().positive('Enter a valid amount'),
  type:        z.enum(['debit', 'credit']),
  category:    z.string().min(1, 'Select a category'),
  date:        z.string().min(1, 'Date required'),
  merchant:    z.string().optional(),
});

export default function AddTransactionModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'debit', date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await financialApi.addTransaction(data);
      toast.success('Transaction added');
      onSuccess();
    } catch (_) {
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">Add Transaction</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹)</label>
              <input {...register('amount')} type="number" step="0.01" placeholder="0.00" className={`input ${errors.amount ? 'input-error' : ''}`} />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="label">Type</label>
              <select {...register('type')} className="input">
                <option value="debit">Expense</option>
                <option value="credit">Income</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input {...register('description')} placeholder="e.g. Grocery shopping" className={`input ${errors.description ? 'input-error' : ''}`} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select {...register('category')} className={`input ${errors.category ? 'input-error' : ''}`}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Date</label>
              <input {...register('date')} type="date" className={`input ${errors.date ? 'input-error' : ''}`} />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Merchant <span className="text-slate-400 font-normal">(optional)</span></label>
            <input {...register('merchant')} placeholder="e.g. Amazon, Zomato" className="input" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving…' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
