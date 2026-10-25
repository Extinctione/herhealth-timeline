import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, FileText, Sparkles, RotateCcw, Activity, CalendarDays, Tag } from 'lucide-react'
import { Card, Button } from '../components/ui.jsx'
import EntryCard from '../components/EntryCard.jsx'
import EntryDetailModal from '../components/EntryDetailModal.jsx'
import {
  getEntries,
  saveEntry,
  deleteEntry,
  loadDemoData,
  clearDemoData,
  isDemoLoaded,
  hasAnyEntries,
  isFirstLaunch,
} from '../lib/storage.js'
import { DEMO_ENTRIES } from '../lib/demoData.js'

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [demoLoaded, setDemoLoaded] = useState(false)

  function refresh() {
    setEntries(getEntries())
    setDemoLoaded(isDemoLoaded())
  }

  useEffect(() => {
    // On the very first time the app is ever opened in this browser (no
    // entries logged yet), seed it with the existing demo data source so
    // the dashboard isn't empty on a fresh launch. This only ever fires
    // once: isFirstLaunch() marks itself seen immediately, so a later
    // "Clear demo data" click (which also empties the entry list) will
    // not cause demo data to silently come back.
    if (isFirstLaunch() && !hasAnyEntries()) {
      loadDemoData(DEMO_ENTRIES)
    }
    refresh()
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = entries.filter((e) => {
      const d = new Date(`${e.date}T00:00:00`)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    const tagCounts = {}
    entries.forEach((e) => (e.tags || []).forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)))
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

    const severities = entries.map((e) => e.severity).filter((s) => typeof s === 'number')
    const avgSeverity = severities.length
      ? (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(1)
      : '—'

    return { total: entries.length, thisMonth, topTag, avgSeverity }
  }, [entries])

  const recent = entries.slice(0, 3)

  function handleLoadDemo() {
    loadDemoData(DEMO_ENTRIES)
    refresh()
  }
  function handleClearDemo() {
    clearDemoData()
    refresh()
  }
  function handleSave(updated) {
    saveEntry(updated)
    refresh()
    setSelected(null)
  }
  function handleDelete(id) {
    deleteEntry(id)
    refresh()
    setSelected(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-lavender-deep">Welcome back</p>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Your health, in your own words.</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Document what you're experiencing, spot patterns over time, and build a clear report to bring to your next
          appointment.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/log">
          <Button>
            <PlusCircle size={18} /> Log an Experience
          </Button>
        </Link>
        <Link to="/health-story">
          <Button variant="lavender">
            <FileText size={18} /> Build My Health Story
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Activity} label="Total entries" value={stats.total} />
        <StatCard icon={CalendarDays} label="This month" value={stats.thisMonth} />
        <StatCard icon={Tag} label="Most noted" value={stats.topTag} small />
        <StatCard icon={Sparkles} label="Avg. severity" value={stats.avgSeverity} />
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-medium text-ink">Demo data</p>
          <p className="text-xs text-ink-soft">
            {demoLoaded
              ? 'Fictional sample entries are loaded so you can explore the app.'
              : 'Load a few fictional sample entries to see the app in action.'}
          </p>
        </div>
        {demoLoaded ? (
          <Button variant="outline" onClick={handleClearDemo}>
            <RotateCcw size={16} /> Clear demo data
          </Button>
        ) : (
          <Button variant="outline" onClick={handleLoadDemo}>
            <Sparkles size={16} /> Load demo data
          </Button>
        )}
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Recent experiences</h2>
          <Link to="/timeline" className="text-sm font-medium text-lavender-deep hover:underline">
            View timeline
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-ink-soft">Nothing logged yet. Start with your first experience, or load demo data above.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recent.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onClick={() => setSelected(entry)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <EntryDetailModal entry={selected} onClose={() => setSelected(null)} onSave={handleSave} onDelete={handleDelete} />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, small }) {
  return (
    <Card className="p-4">
      <Icon size={18} className="text-lavender-deep" />
      <p className={`mt-2 font-serif text-ink ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-ink-faint">{label}</p>
    </Card>
  )
}
