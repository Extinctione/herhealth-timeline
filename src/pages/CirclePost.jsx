import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Flag, ShieldAlert } from 'lucide-react'
import { Card, Button, Badge, Field, TextArea } from '../components/ui.jsx'
import { formatDate, dateToISO } from '../lib/format.js'
import {
  getPost,
  getComments,
  addComment,
  reportPost,
  reportComment,
  isHidden,
  getAnonHandle,
} from '../lib/communityStorage.js'

function BackLink() {
  return (
    <Link to="/circle" className="inline-flex items-center gap-1.5 text-sm font-medium text-lavender-deep hover:underline">
      <ArrowLeft size={15} /> Back to HerCircle
    </Link>
  )
}

export default function CirclePost() {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')

  function refresh() {
    setPost(getPost(postId))
    setComments(getComments(postId))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  if (!post) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Card className="p-10 text-center">
          <p className="text-ink-soft">This discussion couldn't be found. It may have been removed.</p>
        </Card>
      </div>
    )
  }

  const hidden = isHidden(post)

  function handleAddComment(e) {
    e.preventDefault()
    if (!commentText.trim()) {
      setError('Write something before posting.')
      return
    }
    setError('')
    addComment(postId, commentText)
    setCommentText('')
    refresh()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink />

      <Card className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
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
          <button
            type="button"
            onClick={() => {
              reportPost(post.id)
              refresh()
            }}
            className="shrink-0 rounded-full p-2 text-ink-faint hover:bg-blush/40 hover:text-blush-deep"
            aria-label="Report post"
            title="Report post"
          >
            <Flag size={15} />
          </button>
        </div>
        <h1 className="font-serif text-2xl text-ink">{post.title}</h1>
        {hidden ? (
          <p className="text-sm italic text-ink-faint">This post is hidden pending review after multiple reports.</p>
        ) : (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{post.body}</p>
        )}
        <p className="text-xs text-ink-faint">
          {post.authorHandle} · {formatDate(post.createdAt ? dateToISO(new Date(post.createdAt)) : '')}
        </p>
      </Card>

      <div className="space-y-3">
        <h2 className="font-serif text-lg text-ink">
          {comments.length} comment{comments.length === 1 ? '' : 's'}
        </h2>
        {comments.map((c) => {
          const cHidden = isHidden(c)
          return (
            <Card key={c.id} className="space-y-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-ink-faint">
                  {c.authorHandle} · {formatDate(c.createdAt ? dateToISO(new Date(c.createdAt)) : '')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    reportComment(c.id)
                    refresh()
                  }}
                  className="shrink-0 rounded-full p-1.5 text-ink-faint hover:bg-blush/40 hover:text-blush-deep"
                  aria-label="Report comment"
                  title="Report comment"
                >
                  <Flag size={13} />
                </button>
              </div>
              {cHidden ? (
                <p className="text-sm italic text-ink-faint">This comment is hidden pending review.</p>
              ) : (
                <p className="text-sm text-ink">{c.body}</p>
              )}
            </Card>
          )
        })}

        <Card className="p-4">
          <form onSubmit={handleAddComment} className="space-y-3">
            <Field label={`Reply as ${getAnonHandle()}`}>
              <TextArea value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3} placeholder="Share your thoughts…" />
            </Field>
            {error && <p className="text-sm text-blush-deep">{error}</p>}
            <Button type="submit">Post comment</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
