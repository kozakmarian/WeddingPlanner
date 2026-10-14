import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
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
  <Input type="date" className={className} {...props} />
);
export function Select({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  placeholder,
  required = false,
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  'aria-label': string;
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((option) => option.value === value),
    ),
  );
  const listboxId = useId();
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
  }, [options, value]);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div
      ref={root}
      className="relative mt-1.5"
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-required={required || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-left text-[var(--text)] shadow-sm transition hover:border-[var(--primary-light)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--beige-dark)]"
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) =>
              event.key === 'ArrowDown'
                ? (index + 1) % options.length
                : (index - 1 + options.length) % options.length,
            );
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open ? choose(activeIndex) : setOpen(true);
          }
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <span className={selected ? undefined : 'text-[var(--text-light)]'}>
          {selected?.label ?? placeholder}
        </span>
        <span aria-hidden="true" className="text-[var(--primary)]">
          ⌄
        </span>
      </button>
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] p-1 shadow-[var(--shadow-md)]"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={join(
                'cursor-pointer rounded-lg px-3 py-2.5 text-sm text-[var(--text)] transition',
                option.value === value
                  ? 'bg-[var(--beige-dark)] font-semibold text-[var(--primary-dark)]'
                  : 'hover:bg-[var(--beige-light)]',
                activeIndex === index && 'ring-1 ring-[var(--primary-light)]',
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
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
