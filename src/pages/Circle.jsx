import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Flag, Sparkles, RotateCcw, ShieldAlert } from 'lucide-react'
import { Card, Button, Badge, Field, TextInput, TextArea, Select } from '../components/ui.jsx'
import { formatDate, dateToISO } from '../lib/format.js'
import { COMMUNITY_CATEGORIES } from '../lib/tags.js'
import {
  getPosts,
  createPost,
  reportPost,
  isHidden,
  commentCountFor,
  isDemoLoaded,
  loadDemoDiscussions,
  clearDemoDiscussions,
  getAnonHandle,
} from '../lib/communityStorage.js'
import { DEMO_DISCUSSIONS } from '../lib/communityDemoData.js'

export default function Circle() {
  const [posts, setPosts] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(COMMUNITY_CATEGORIES[0])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [demoLoaded, setDemoLoaded] = useState(false)

  function refresh() {
    setPosts(getPosts())
    setDemoLoaded(isDemoLoaded())
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(
    () => (categoryFilter ? posts.filter((p) => p.category === categoryFilter) : posts),
    [posts, categoryFilter]
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setError('Add a title and a bit of detail before posting.')
      return
    }
    setError('')
    createPost({ title, body, category })
    setTitle('')
    setBody('')
    setShowForm(false)
    refresh()
  }

  function handleReport(id) {
    reportPost(id)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-ink">HerCircle</h1>
          <p className="text-ink-soft">
            An anonymous space to ask, share, and read about women's health experiences. Posting as{' '}
            <strong>{getAnonHandle()}</strong>.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <PlusCircle size={18} /> {showForm ? 'Cancel' : 'New post'}
        </Button>
      </div>

      <Card className="rounded-2xl bg-lavender/40 p-4 text-xs text-ink-soft leading-relaxed">
        HerCircle is for peer discussion, not medical advice. Posts are anonymous and are never linked to your
        personal Timeline — nothing you log there is shared here automatically.
      </Card>

      {showForm && (
        <Card className="p-5 animate-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Title" required>
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?" />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {COMMUNITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Details" required hint="Posted anonymously — avoid sharing identifying details.">
              <TextArea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
            </Field>
            {error && <p className="text-sm text-blush-deep">{error}</p>}
            <Button type="submit">Post anonymously</Button>
          </form>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            !categoryFilter ? 'bg-lavender-dark border-lavender-deep text-ink' : 'bg-white border-ink-faint/30 text-ink-soft'
          }`}
        >
          All
        </button>
        {COMMUNITY_CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              categoryFilter === c ? 'bg-lavender-dark border-lavender-deep text-ink' : 'bg-white border-ink-faint/30 text-ink-soft'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-medium text-ink">Demo discussions</p>
          <p className="text-xs text-ink-soft">
            {demoLoaded
              ? 'Fictional sample discussions are loaded.'
              : 'Load a few fictional discussions to see HerCircle in action.'}
          </p>
        </div>
        {demoLoaded ? (
          <Button
            variant="outline"
            onClick={() => {
              clearDemoDiscussions()
              refresh()
            }}
          >
            <RotateCcw size={16} /> Clear demo discussions
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              loadDemoDiscussions(DEMO_DISCUSSIONS)
              refresh()
            }}
          >
            <Sparkles size={16} /> Load demo discussions
          </Button>
        )}
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-ink-soft">No discussions yet. Be the first to post, or load demo discussions above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            const hidden = isHidden(post)
            const count = commentCountFor(post.id)
            return (
              <Card key={post.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/circle/${post.id}`} className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="sage">{post.category}</Badge>
                      {post.isDemo && <Badge tone="blush">Demo</Badge>}
                      {hidden && (
                        <Badge tone="neutral">
                          <ShieldAlert size={11} className="mr-1 inline -mt-0.5" />
                          Under review
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 font-serif text-lg text-ink line-clamp-1 hover:underline">{post.title}</p>
                    {!hidden && <p className="mt-1 text-sm text-ink-soft line-clamp-2">{post.body}</p>}
                    {hidden && (
                      <p className="mt-1 text-sm italic text-ink-faint">Hidden pending review after multiple reports.</p>
                    )}
                    <p className="mt-2 text-xs text-ink-faint">
                      {post.authorHandle} · {formatDate(post.createdAt ? dateToISO(new Date(post.createdAt)) : '')} · {count} comment{count === 1 ? '' : 's'}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleReport(post.id)}
                    className="shrink-0 rounded-full p-2 text-ink-faint hover:bg-blush/40 hover:text-blush-deep"
                    aria-label="Report post"
                    title="Report post"
                  >
                    <Flag size={15} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
