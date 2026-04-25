/**
 * MetricCard — plug-and-play KPI card
 * Works in any agent module.
 *
 * Props:
 *  title       string       - metric name
 *  value       string|number- display value
 *  subtitle    string       - secondary line
 *  change      number       - % change (positive = green, negative = red)
 *  changeLabel string       - e.g. "vs last month"
 *  icon        ReactNode    - icon component
 *  iconBg      string       - tailwind bg class (default: bg-primary-50)
 *  iconColor   string       - tailwind text class (default: text-primary-600)
 *  loading     boolean
 *  onClick     fn
 */
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last month',
  icon,
  iconBg    = 'bg-primary-50',
  iconColor = 'text-primary-600',
  loading   = false,
  onClick,
  className,
}) {
  const hasChange = change !== undefined && change !== null;
  const isPositive = change > 0;
  const isNeutral  = change === 0;

  return (
    <div
      className={clsx('card p-5 flex flex-col gap-3', onClick && 'cursor-pointer hover:shadow-card-md transition-shadow', className)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500 leading-tight">{title}</p>
        {icon && (
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            <span className={iconColor}>{icon}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-7 bg-slate-100 rounded-lg w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
        </div>
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          {hasChange && (
            <div className="flex items-center gap-1">
              {isNeutral ? (
                <Minus size={12} className="text-slate-400" />
              ) : isPositive ? (
                <TrendingUp size={12} className="text-emerald-500" />
              ) : (
                <TrendingDown size={12} className="text-red-500" />
              )}
              <span className={clsx(
                'text-xs font-semibold',
                isNeutral ? 'text-slate-500' : isPositive ? 'text-emerald-600' : 'text-red-600',
              )}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-slate-400">{changeLabel}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
