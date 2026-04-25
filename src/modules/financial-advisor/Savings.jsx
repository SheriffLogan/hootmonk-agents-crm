import { useState } from 'react';
import { useSavingsGoals } from './hooks/useFinancial';
import { ProgressBar, InsightCard, PageHeader, MetricCard } from '../../components/common';
import { PiggyBank, Target, Plus, Loader2, Pencil, Trash2, X, Calendar, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { financialApi } from './api/financialApi';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import dayjs from 'dayjs';

// ─── Goal color themes ───────────────────────────────────────────────────────
const GOAL_COLORS = ['primary','success','warning','danger'];
const GOAL_THEMES = [
  { bg: 'bg-primary-50',  border: 'border-primary-200', icon: 'text-primary-600' },
  { bg: 'bg-emerald-50',  border: 'border-emerald-200', icon: 'text-emerald-600' },
  { bg: 'bg-amber-50',    border: 'border-amber-200',   icon: 'text-amber-600'   },
  { bg: 'bg-blue-50',     border: 'border-blue-200',    icon: 'text-blue-600'    },
];

const goalSchema = z.object({
  name:          z.string().min(1, 'Goal name is required'),
  targetAmount:  z.coerce.number().positive('Enter a valid target'),
  currentAmount: z.coerce.number().min(0, 'Cannot be negative'),
  targetDate:    z.string().min(1, 'Target date is required'),
  notes:         z.string().optional(),
});

function GoalModal({ goal, onClose, onSuccess }) {
  const isEdit = !!goal;
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: goal ? {
      name: goal.name, targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount, targetDate: goal.targetDate?.split('T')[0] ?? '',
      notes: goal.notes ?? '',
    } : { currentAmount: 0 },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) await financialApi.updateGoal(goal.id, data);
      else        await financialApi.createGoal(data);
      toast.success(isEdit ? 'Goal updated' : 'Goal created');
      onSuccess();
    } catch (_) {
      toast.error('Failed to save goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Goal' : 'New Savings Goal'}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={16}/></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Goal Name</label>
            <input {...register('name')} placeholder="e.g. Emergency Fund, New Car" className={`input ${errors.name?'input-error':''}`} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Amount (₹)</label>
              <input {...register('targetAmount')} type="number" step="100" placeholder="500000" className={`input ${errors.targetAmount?'input-error':''}`} />
              {errors.targetAmount && <p className="mt-1 text-xs text-red-600">{errors.targetAmount.message}</p>}
            </div>
            <div>
              <label className="label">Saved So Far (₹)</label>
              <input {...register('currentAmount')} type="number" step="100" placeholder="0" className={`input ${errors.currentAmount?'input-error':''}`} />
              {errors.currentAmount && <p className="mt-1 text-xs text-red-600">{errors.currentAmount.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Target Date</label>
            <input {...register('targetDate')} type="date" className={`input ${errors.targetDate?'input-error':''}`} />
            {errors.targetDate && <p className="mt-1 text-xs text-red-600">{errors.targetDate.message}</p>}
          </div>

          <div>
            <label className="label">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
            <input {...register('notes')} placeholder="Any notes about this goal" className="input" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GoalCard({ goal, index, onEdit, onDelete }) {
  const theme   = GOAL_THEMES[index % GOAL_THEMES.length];
  const color   = GOAL_COLORS[index % GOAL_COLORS.length];
  const pct     = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const daysLeft= dayjs(goal.targetDate).diff(dayjs(), 'day');
  const monthly = Math.ceil((goal.targetAmount - goal.currentAmount) / Math.max(1, Math.ceil(daysLeft / 30)));

  return (
    <div className={clsx('rounded-xl border p-5 space-y-4', theme.bg, theme.border)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-800">{goal.name}</h4>
          {goal.notes && <p className="text-xs text-slate-500 mt-0.5">{goal.notes}</p>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(goal)} className="btn-ghost p-1.5 rounded-lg"><Pencil size={13}/></button>
          <button onClick={() => onDelete(goal.id)} className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
        </div>
      </div>

      <ProgressBar value={pct} color={color} size="md" showValue />

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white/70 rounded-lg p-2.5">
          <p className="text-slate-500 mb-0.5">Saved</p>
          <p className="font-bold text-slate-800">₹{Number(goal.currentAmount).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2.5">
          <p className="text-slate-500 mb-0.5">Target</p>
          <p className="font-bold text-slate-800">₹{Number(goal.targetAmount).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2.5">
          <p className="text-slate-500 mb-0.5 flex items-center gap-1"><Calendar size={10}/> Target date</p>
          <p className="font-semibold text-slate-700">{dayjs(goal.targetDate).format('MMM YYYY')}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2.5">
          <p className="text-slate-500 mb-0.5 flex items-center gap-1"><TrendingUp size={10}/> Save / mo</p>
          <p className="font-semibold text-slate-700">₹{Number(monthly).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {daysLeft > 0 && (
        <p className="text-xs text-slate-500">{daysLeft} days remaining</p>
      )}
      {daysLeft <= 0 && pct < 100 && (
        <p className="text-xs text-red-500 font-medium">Past target date — consider updating your goal</p>
      )}
      {pct >= 100 && (
        <p className="text-xs text-emerald-600 font-semibold">🎉 Goal achieved!</p>
      )}
    </div>
  );
}

export default function FASavings() {
  const { data: goals, loading, refetch } = useSavingsGoals();
  const [showModal, setShowModal] = useState(false);
  const [editGoal,  setEditGoal]  = useState(null);

  const goalList = goals ?? [];
  const totalSaved  = goalList.reduce((s, g) => s + (g.currentAmount ?? 0), 0);
  const totalTarget = goalList.reduce((s, g) => s + (g.targetAmount  ?? 0), 0);
  const completed   = goalList.filter((g) => g.currentAmount >= g.targetAmount).length;

  const handleDelete = async (id) => {
    if (!confirm('Delete this savings goal?')) return;
    try {
      await financialApi.deleteGoal(id);
      toast.success('Goal deleted');
      refetch();
    } catch (_) { toast.error('Failed to delete goal'); }
  };

  const handleEdit = (goal) => { setEditGoal(goal); setShowModal(true); };
  const handleNew  = ()     => { setEditGoal(null); setShowModal(true); };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Savings Goals"
        subtitle="Track your savings milestones and stay on target"
        actions={
          <button onClick={handleNew} className="btn-primary btn-sm">
            <Plus size={13}/> New Goal
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Saved"     value={`₹${Number(totalSaved).toLocaleString('en-IN')}`}  icon={<PiggyBank size={18}/>} iconBg="bg-emerald-50" iconColor="text-emerald-600" loading={loading} />
        <MetricCard title="Total Target"    value={`₹${Number(totalTarget).toLocaleString('en-IN')}`} icon={<Target size={18}/>}    iconBg="bg-primary-50"  iconColor="text-primary-600" loading={loading} />
        <MetricCard title="Goals Completed" value={`${completed} / ${goalList.length}`}               icon={<TrendingUp size={18}/>} iconBg="bg-blue-50"    iconColor="text-blue-600"   loading={loading} />
      </div>

      {/* Global progress */}
      {!loading && totalTarget > 0 && (
        <div className="card p-5 mb-6">
          <ProgressBar
            value={Math.round((totalSaved / totalTarget) * 100)}
            label="Overall savings progress"
            sublabel={`₹${Number(totalTarget - totalSaved).toLocaleString('en-IN')} remaining across all goals`}
            color="primary"
            size="lg"
          />
        </div>
      )}

      {/* AI insight */}
      {!loading && goalList.length > 0 && (
        <div className="mb-5">
          <InsightCard
            type="tip"
            title="Smart savings tip"
            body={`Based on your spending patterns, automating ₹${Math.ceil(goalList[0]?.monthlyNeeded ?? 5000).toLocaleString('en-IN')}/month via a recurring transfer on your salary day is the most effective way to reach your "${goalList[0]?.name}" goal on time.`}
          />
        </div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : goalList.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <PiggyBank size={22} className="text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">No savings goals yet</p>
          <p className="text-xs text-slate-500 mb-4">Create your first goal to start tracking your savings journey.</p>
          <button onClick={handleNew} className="btn-primary btn-sm mx-auto">
            <Plus size={13}/> Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goalList.map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} index={i} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={editGoal}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
          onSuccess={() => { setShowModal(false); setEditGoal(null); refetch(); }}
        />
      )}
    </div>
  );
}
