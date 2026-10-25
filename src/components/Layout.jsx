import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Heart, Home, PlusCircle, Clock, Droplet, FileText, MessageCircle, Users, Stethoscope, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/log', label: 'Log an Experience', icon: PlusCircle },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/her-cycle', label: 'HerCycle', icon: Droplet },
  { to: '/health-story', label: 'Health Story', icon: FileText },
  { to: '/hera', label: 'Hera', icon: MessageCircle },
  { to: '/circle', label: 'HerCircle', icon: Users },
  { to: '/care-connect', label: 'Care Connect', icon: Stethoscope },
]

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-lavender text-ink shadow-sm'
                : 'text-ink-soft hover:bg-cream-dark hover:text-ink'
            }`
          }
        >
          <Icon size={18} strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-cream-dark bg-white/60 backdrop-blur-sm px-5 py-7">
        <div className="mb-8 flex items-center gap-2 px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush-dark text-white">
            <Heart size={18} fill="currentColor" strokeWidth={0} />
          </span>
          <div>
            <p className="font-serif text-lg leading-none text-ink">HerHealth</p>
            <p className="text-xs text-ink-faint leading-none mt-0.5">Timeline</p>
          </div>
        </div>
        <NavLinks />
        <div className="mt-auto rounded-xl bg-lavender/60 p-4 text-xs text-ink-soft leading-relaxed">
          This is a documentation tool, not a diagnostic app. Always share what you record here with a healthcare professional.
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-cream-dark bg-cream/90 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-dark text-white">
            <Heart size={16} fill="currentColor" strokeWidth={0} />
          </span>
          <p className="font-serif text-base text-ink">HerHealth Timeline</p>
        </div>
        <button
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-full p-2 text-ink hover:bg-cream-dark"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {mobileOpen && (
        <div className="lg:hidden border-b border-cream-dark bg-white px-4 py-3 animate-in">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  )
}
