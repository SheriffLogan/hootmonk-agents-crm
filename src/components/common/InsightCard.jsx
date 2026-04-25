/**
 * InsightCard — AI-style insight/recommendation card
 * Reusable across all agent modules.
 *
 * Props:
 *  type        'tip'|'warning'|'success'|'info'
 *  title       string
 *  body        string
 *  action      { label, onClick }
 *  icon        ReactNode (optional override)
 *  loading     boolean
 */
import clsx from 'clsx';
import { Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const CONFIGS = {
  tip:     { icon: Lightbulb,     bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  iconColor: 'text-amber-500'  },
  warning: { icon: AlertTriangle, bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',    iconColor: 'text-red-500'    },
  success: { icon: CheckCircle,   bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',iconColor: 'text-emerald-500'},
  info:    { icon: Info,          bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',   iconColor: 'text-blue-500'   },
};

export default function InsightCard({ type = 'info', title, body, action, icon, loading = false, className }) {
  const cfg = CONFIGS[type] ?? CONFIGS.info;
  const DefaultIcon = cfg.icon;

  if (loading) {
    return (
      <div className={clsx('rounded-xl border p-4 space-y-2 animate-pulse bg-slate-50 border-slate-200', className)}>
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
      </div>
    );
  }

  return (
    <div className={clsx('rounded-xl border p-4', cfg.bg, cfg.border, className)}>
      <div className="flex gap-3">
        <div className={clsx('flex-shrink-0 mt-0.5', cfg.iconColor)}>
          {icon ?? <DefaultIcon size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className={clsx('text-sm font-semibold mb-0.5', cfg.text)}>{title}</p>
          )}
          {body && (
            <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={clsx('mt-2 text-xs font-semibold underline underline-offset-2', cfg.text)}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
