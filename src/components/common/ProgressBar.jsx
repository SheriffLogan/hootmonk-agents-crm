/**
 * ProgressBar — reusable progress indicator with optional label and value display.
 *
 * Props:
 *  value     number  0–100
 *  label     string
 *  sublabel  string
 *  color     'primary'|'success'|'warning'|'danger'
 *  size      'sm'|'md'|'lg'
 *  showValue boolean
 *  animated  boolean
 */
import clsx from 'clsx';

const COLOR_MAP = {
  primary: 'bg-primary-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
};

const SIZE_MAP = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export default function ProgressBar({
  value      = 0,
  label,
  sublabel,
  color      = 'primary',
  size       = 'md',
  showValue  = true,
  animated   = false,
  className,
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2">
          <div>
            {label    && <p className="text-sm font-medium text-slate-700 leading-none">{label}</p>}
            {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
          </div>
          {showValue && (
            <span className="text-sm font-semibold text-slate-800 flex-shrink-0">{clamped}%</span>
          )}
        </div>
      )}
      <div className={clsx('w-full rounded-full bg-slate-100 overflow-hidden', SIZE_MAP[size])}>
        <div
          className={clsx('rounded-full transition-all duration-700', COLOR_MAP[color], SIZE_MAP[size], animated && 'animate-pulse-slow')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
