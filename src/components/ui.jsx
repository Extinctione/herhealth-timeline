// Small shared UI primitives, kept in one file to stay hackathon-lean.

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white/70 border border-cream-dark shadow-sm backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-ink text-cream hover:bg-ink/90 shadow-sm hover:shadow-md',
    blush: 'bg-blush-dark text-ink hover:bg-blush-deep hover:text-white shadow-sm',
    lavender: 'bg-lavender-dark text-ink hover:bg-lavender-deep hover:text-white shadow-sm',
    ghost: 'bg-transparent text-ink-soft hover:bg-cream-dark hover:text-ink',
    outline: 'bg-transparent border border-ink-faint/50 text-ink hover:bg-cream-dark',
    danger: 'bg-transparent text-blush-deep hover:bg-blush/60',
  }
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'lavender', className = '' }) {
  const tones = {
    lavender: 'bg-lavender text-ink',
    blush: 'bg-blush text-ink',
    sage: 'bg-sage text-ink',
    neutral: 'bg-cream-dark text-ink-soft',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone] || tones.lavender} ${className}`}
    >
      {children}
    </span>
  )
}

export function Field({ label, hint, children, required, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-blush-deep"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-xl border border-ink-faint/40 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-lavender-deep outline-none transition-colors'

export function TextInput({ className = '', ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />
}

export function TextArea({ className = '', ...props }) {
  return <textarea className={`${inputBase} resize-y ${className}`} rows={4} {...props} />
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${inputBase} bg-white ${className}`} {...props}>
      {children}
    </select>
  )
}

export function SeverityDots({ value }) {
  if (!value) return <span className="text-ink-faint text-sm">—</span>
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-semibold text-ink">{value}</span>
      <span className="text-ink-faint text-xs">/ 10</span>
    </span>
  )
}
