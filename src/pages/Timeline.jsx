import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, PlusCircle, SlidersHorizontal } from 'lucide-react'
import { Card, Button, TextInput, Select } from '../components/ui.jsx'
import EntryCard from '../components/EntryCard.jsx'
import EntryDetailModal from '../components/EntryDetailModal.jsx'
import { getEntries, saveEntry, deleteEntry } from '../lib/storage.js'
import { BODY_AREAS, SUGGESTED_TAGS } from '../lib/tags.js'

export default function Timeline() {
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [bodyAreaFilter, setBodyAreaFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  function refresh() {
    setEntries(getEntries())
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      if (bodyAreaFilter && e.bodyArea !== bodyAreaFilter) return false
      if (tagFilter && !(e.tags || []).includes(tagFilter)) return false
      if (!q) return true
      const haystack = `${e.description} ${(e.tags || []).join(' ')} ${e.notes || ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [entries, query, bodyAreaFilter, tagFilter])

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">Your Timeline</h1>
          <p className="text-ink-soft">{entries.length} experience{entries.length === 1 ? '' : 's'} documented</p>
        </div>
        <Link to="/log">
          <Button>
            <PlusCircle size={18} /> Log an Experience
          </Button>
        </Link>
      </div>

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search descriptions, tags, notes…"
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal size={16} /> Filters
          </Button>
        </div>
        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-2 animate-in">
            <Select value={bodyAreaFilter} onChange={(e) => setBodyAreaFilter(e.target.value)}>
              <option value="">All body areas</option>
              {BODY_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
            <Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
              <option value="">All tags</option>
              {SUGGESTED_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        )}
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-ink-soft">
            {entries.length === 0
              ? 'No experiences logged yet.'
              : 'No entries match your search or filters.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onClick={() => setSelected(entry)} />
          ))}
        </div>
      )}

      {selected && (
        <EntryDetailModal entry={selected} onClose={() => setSelected(null)} onSave={handleSave} onDelete={handleDelete} />
      )}
    </div>
  )
}
