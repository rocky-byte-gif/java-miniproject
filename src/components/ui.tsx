import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

/* -------------------------------------------------------------------------- */
/*                               Input Styles                                 */
/* -------------------------------------------------------------------------- */
export const input =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition duration-150 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20';

export const select =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition duration-150 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 dark:focus:border-cyan-400';

/* -------------------------------------------------------------------------- */
/*                               Button Styles                                */
/* -------------------------------------------------------------------------- */
export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-cyan-600/20 transition-all duration-150 hover:from-cyan-500 hover:to-teal-500 hover:shadow-md hover:shadow-cyan-600/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-150 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50',
  ghost:
    'inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 disabled:opacity-50',
  danger:
    'inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2 text-sm font-medium text-rose-700 transition duration-150 hover:bg-rose-100 active:scale-[0.98] dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/80 disabled:opacity-50',
  success:
    'inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-sm font-medium text-emerald-700 transition duration-150 hover:bg-emerald-100 active:scale-[0.98] dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/80',
};

/* -------------------------------------------------------------------------- */
/*                               Badge Component                              */
/* -------------------------------------------------------------------------- */
const tones: Record<string, { bg: string; dot: string }> = {
  green: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/40',
    dot: 'bg-sky-500',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  red: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/40',
    dot: 'bg-rose-500',
  },
  violet: {
    bg: 'bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/40',
    dot: 'bg-violet-500',
  },
  cyan: {
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/40',
    dot: 'bg-cyan-500',
  },
  gray: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
};

export function Badge({
  tone = 'gray',
  dot = false,
  children,
  className = '',
}: {
  tone?: keyof typeof tones;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const current = tones[tone] || tones.gray;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${current.bg} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Avatar Component                             */
/* -------------------------------------------------------------------------- */
const gradients = [
  'from-cyan-500 to-blue-600',
  'from-teal-500 to-emerald-600',
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-amber-600',
  'from-violet-500 to-pink-600',
];

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const grad = gradients[hash % gradients.length];
  const dims = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} font-semibold text-white shadow-sm ${dims}`}
    >
      {initials || 'U'}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Card Component                              */
/* -------------------------------------------------------------------------- */
export function Card({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-100 backdrop-blur-sm dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none ${className}`}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-cyan-600 dark:text-cyan-400">{icon}</div>}
            <div>
              {title && <h2 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              StatCard Component                            */
/* -------------------------------------------------------------------------- */
export function StatCard({
  title,
  value,
  subvalue,
  icon,
  trend,
  color = 'cyan',
}: {
  title: string;
  value: string | number;
  subvalue?: string;
  icon: ReactNode;
  trend?: { label: string; positive: boolean };
  color?: 'cyan' | 'emerald' | 'amber' | 'violet' | 'rose';
}) {
  const colorMap = {
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm shadow-slate-100 transition duration-150 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{title}</span>
          <div className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
          {subvalue && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subvalue}</div>}
        </div>
        <div className={`rounded-xl p-3 ${colorMap[color]}`}>{icon}</div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.label}
          </span>
          <span className="text-slate-400 dark:text-slate-500">vs target</span>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Field Component                              */
/* -------------------------------------------------------------------------- */
export function Field({
  label,
  children,
  error,
  required = false,
  hint,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {hint && <span className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-600 dark:text-rose-400">{error}</span>}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Table Component                              */
/* -------------------------------------------------------------------------- */
export function Table({
  head,
  children,
  empty,
}: {
  head: string[];
  children: ReactNode;
  empty?: string;
}) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">{children}</tbody>
      </table>
      {!hasRows && (
        <div className="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
          <Info size={28} className="mx-auto mb-2 opacity-50" />
          <p>{empty ?? 'No records available.'}</p>
        </div>
      )}
    </div>
  );
}

export const td = 'whitespace-nowrap px-4 py-3.5';

/* -------------------------------------------------------------------------- */
/*                             PageHeader Component                           */
/* -------------------------------------------------------------------------- */
export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sub}</p>
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Modal Component                              */
/* -------------------------------------------------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  maxWidth = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-cyan-600 dark:text-cyan-400">{icon}</div>}
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Toast Notification System                       */
/* -------------------------------------------------------------------------- */
interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'info' | 'warn';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warn') => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warn' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'border-emerald-300 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/95 dark:text-emerald-200'
                : t.type === 'error'
                ? 'border-rose-300 bg-rose-50/95 text-rose-900 dark:border-rose-800 dark:bg-rose-950/95 dark:text-rose-200'
                : t.type === 'warn'
                ? 'border-amber-300 bg-amber-50/95 text-amber-900 dark:border-amber-800 dark:bg-amber-950/95 dark:text-amber-200'
                : 'border-cyan-300 bg-cyan-50/95 text-cyan-900 dark:border-cyan-800 dark:bg-cyan-950/95 dark:text-cyan-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />}
            {t.type === 'warn' && <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />}
            {t.type === 'info' && <Info size={18} className="text-cyan-600 dark:text-cyan-400 shrink-0" />}
            <span className="max-w-sm">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 rounded-lg p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
