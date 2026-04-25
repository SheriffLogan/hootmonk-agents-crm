/**
 * ChartWidget — plug-and-play chart card wrapper
 * Wraps any Recharts component with consistent card styling, title, and empty state.
 *
 * Props:
 *  title      string
 *  subtitle   string
 *  actions    ReactNode  - right-side actions (e.g., period selector)
 *  loading    boolean
 *  empty      boolean
 *  emptyText  string
 *  height     number (default: 260)
 *  children   ReactNode  - Recharts component
 */
import clsx from 'clsx';
import { BarChart3 } from 'lucide-react';

export default function ChartWidget({
  title,
  subtitle,
  actions,
  loading  = false,
  empty    = false,
  emptyText = 'No data available yet',
  height   = 260,
  children,
  className,
}) {
  return (
    <div className={clsx('card', className)}>
      {/* Header */}
      {(title || actions) && (
        <div className="card-header flex items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}

      {/* Body */}
      <div className="card-body">
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-primary-200" />
              <div className="absolute inset-0 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
            </div>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-400" style={{ height }}>
            <BarChart3 size={32} className="opacity-30" />
            <p className="text-xs">{emptyText}</p>
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </div>
    </div>
  );
}
