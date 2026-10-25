import { Badge, SeverityDots } from './ui.jsx'
import { formatDate } from '../lib/format.js'

export default function EntryCard({ entry, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-2xl border border-cream-dark bg-white/70 p-5 text-left shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{formatDate(entry.date)}</p>
          <p className="mt-1 text-[15px] leading-snug text-ink line-clamp-2">{entry.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <SeverityDots value={entry.severity} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {entry.bodyArea && <Badge tone="sage">{entry.bodyArea}</Badge>}
        {entry.tags?.slice(0, 3).map((tag) => (
          <Badge key={tag} tone="lavender">
            {tag}
          </Badge>
        ))}
        {entry.tags?.length > 3 && <Badge tone="neutral">+{entry.tags.length - 3} more</Badge>}
        {entry.isDemo && <Badge tone="blush">Demo data</Badge>}
      </div>
    </button>
  )
}
