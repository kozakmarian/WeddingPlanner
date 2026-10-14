import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import { IoCalendarOutline } from 'react-icons/io5';
const join = (...parts: (string | undefined | false)[]) => parts.filter(Boolean).join(' ');
export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  const styles = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]',
    secondary:
      'bg-[var(--background-secondary)] text-[var(--primary-dark)] hover:bg-[var(--beige-dark)]',
    ghost: 'bg-transparent text-[var(--primary-dark)] hover:bg-[var(--beige-light)]',
    danger: 'bg-[var(--error)] text-white hover:opacity-90',
  };
  return (
    <button
      className={join(
        'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-[var(--text)]">
      <span>{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-[var(--error)]">
          {error}
        </span>
      )}
    </label>
  );
}
export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={join(
      'mt-1.5 block min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-[var(--text)] shadow-sm outline-none placeholder:text-[var(--text-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--beige-dark)]',
      className,
    )}
    {...props}
  />
);
export const DateInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative mt-1.5">
    <Input type="date" className={join('mt-0 pr-10', className)} {...props} />
    <IoCalendarOutline
      aria-hidden="true"
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-lg text-[var(--primary)]"
    />
  </div>
);
export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={join(
      'mt-1.5 block min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--beige-dark)]',
      className,
    )}
    {...props}
  />
);
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={join(
        'rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-[var(--shadow-sm)] sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--primary)] sm:text-4xl">
        {title}
      </h1>
      {children}
    </div>
  );
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'error';
}) {
  const tones = {
    neutral: 'bg-[var(--beige-light)] text-[var(--primary-dark)]',
    success: 'bg-[#e6f0dd] text-[var(--secondary-dark)]',
    warning: 'bg-[#fbebd8] text-[#80572d]',
    error: 'bg-[#f9e1de] text-[#922f25]',
  };
  return (
    <span className={join('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', tones[tone])}>
      {children}
    </span>
  );
}
export function State({
  children,
  ...props
}: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card className="text-[var(--text-muted)]" {...props}>
      {children}
    </Card>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-xl bg-[#e6f0dd] px-4 py-3 text-sm font-medium text-[var(--secondary-dark)]"
    >
      {children}
    </p>
  );
}
