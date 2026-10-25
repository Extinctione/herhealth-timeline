// localStorage-backed data layer for HerCircle (the community). This is
// entirely separate storage from the personal Timeline (see storage.js) —
// nothing here is ever derived from, or linked to, Timeline entries.
// Posting is anonymous: there is no account system, just a per-browser
// generated handle (see getAnonHandle) that is never sent anywhere.

const POSTS_KEY = 'herhealth_circle_posts_v1'
const COMMENTS_KEY = 'herhealth_circle_comments_v1'
const HANDLE_KEY = 'herhealth_circle_handle_v1'
const DEMO_FLAG_KEY = 'herhealth_circle_demo_loaded_v1'

// Basic reporting: once a post/comment collects this many reports it is
// treated as "hidden pending review" in the UI (content is withheld, but
// the item isn't deleted, mirroring simple community-moderation queues).
const REPORT_HIDE_THRESHOLD = 3

const ADJECTIVES = ['Gentle', 'Quiet', 'Hopeful', 'Steady', 'Curious', 'Calm', 'Resilient', 'Kind', 'Brave', 'Patient']
const NOUNS = ['Iris', 'Willow', 'Maple', 'Harbor', 'Meadow', 'Sparrow', 'River', 'Lotus', 'Ember', 'Pearl']

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** A persistent, randomly generated anonymous display name, local to this
 * browser only. Never derived from any personal or Timeline data, and
 * never sent anywhere outside this device — it just lets you recognize
 * your own posts across a session. */
export function getAnonHandle() {
  let handle = window.localStorage.getItem(HANDLE_KEY)
  if (!handle) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    handle = `Anonymous ${adj} ${noun}`
    window.localStorage.setItem(HANDLE_KEY, handle)
  }
  return handle
}

export function getPosts() {
  return readJSON(POSTS_KEY, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getPost(id) {
  return readJSON(POSTS_KEY, []).find((p) => p.id === id) || null
}

export function createPost({ title, body, category }) {
  const posts = readJSON(POSTS_KEY, [])
  const post = {
    id: makeId('post'),
    title: title.trim(),
    body: body.trim(),
    category,
    authorHandle: getAnonHandle(),
    createdAt: new Date().toISOString(),
    reportCount: 0,
    isDemo: false,
  }
  posts.push(post)
  writeJSON(POSTS_KEY, posts)
  return post
}

export function reportPost(id) {
  const posts = readJSON(POSTS_KEY, [])
  const idx = posts.findIndex((p) => p.id === id)
  if (idx === -1) return null
  posts[idx] = { ...posts[idx], reportCount: (posts[idx].reportCount || 0) + 1 }
  writeJSON(POSTS_KEY, posts)
  return posts[idx]
}

export function getComments(postId) {
  return readJSON(COMMENTS_KEY, [])
    .filter((c) => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export function commentCountFor(postId) {
  return readJSON(COMMENTS_KEY, []).filter((c) => c.postId === postId).length
}

export function addComment(postId, body) {
  const comments = readJSON(COMMENTS_KEY, [])
  const comment = {
    id: makeId('comment'),
    postId,
    body: body.trim(),
    authorHandle: getAnonHandle(),
    createdAt: new Date().toISOString(),
    reportCount: 0,
    isDemo: false,
  }
  comments.push(comment)
  writeJSON(COMMENTS_KEY, comments)
  return comment
}

export function reportComment(id) {
  const comments = readJSON(COMMENTS_KEY, [])
  const idx = comments.findIndex((c) => c.id === id)
  if (idx === -1) return null
  comments[idx] = { ...comments[idx], reportCount: (comments[idx].reportCount || 0) + 1 }
  writeJSON(COMMENTS_KEY, comments)
  return comments[idx]
}

export function isHidden(item) {
  return (item?.reportCount || 0) >= REPORT_HIDE_THRESHOLD
}

// --- Demo discussions (fictional, clearly labeled) -------------------------

export function isDemoLoaded() {
  return window.localStorage.getItem(DEMO_FLAG_KEY) === 'true'
}

export function loadDemoDiscussions(demoPosts) {
  const posts = readJSON(POSTS_KEY, []).filter((p) => !p.isDemo)
  const comments = readJSON(COMMENTS_KEY, []).filter((c) => !c.isDemo)
  const seededPosts = []
  const seededComments = []

  demoPosts.forEach((dp, i) => {
    const postId = `demo_post_${i}`
    seededPosts.push({
      id: postId,
      title: dp.title,
      body: dp.body,
      category: dp.category,
      authorHandle: dp.authorHandle,
      createdAt: dp.createdAt,
      reportCount: 0,
      isDemo: true,
    })
    ;(dp.comments || []).forEach((c, j) => {
      seededComments.push({
        id: `demo_comment_${i}_${j}`,
        postId,
        body: c.body,
        authorHandle: c.authorHandle,
        createdAt: c.createdAt,
        reportCount: 0,
        isDemo: true,
      })
    })
  })

  writeJSON(POSTS_KEY, [...posts, ...seededPosts])
  writeJSON(COMMENTS_KEY, [...comments, ...seededComments])
  window.localStorage.setItem(DEMO_FLAG_KEY, 'true')
}

export function clearDemoDiscussions() {
  writeJSON(POSTS_KEY, readJSON(POSTS_KEY, []).filter((p) => !p.isDemo))
  writeJSON(COMMENTS_KEY, readJSON(COMMENTS_KEY, []).filter((c) => !c.isDemo))
  window.localStorage.removeItem(DEMO_FLAG_KEY)
}
