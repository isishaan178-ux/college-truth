'use client'

import { useEffect, useState, useCallback, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Check,
  Trash2,
  CheckCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react'

interface Post {
  _id: string
  collegeName: string
  collegeSlug: string
  category: string
  sentiment: string
  source: string
  sourceUrl: string
  content: string
  title: string
  upvotes: number
  author: string
  verified: boolean
  isApproved: boolean
  createdAt: string
}

interface ThreadGroup {
  threadTitle: string
  mainPost: Post | null
  comments: Post[]
}

const CATEGORY_COLORS: Record<string, string> = {
  PLACEMENTS: 'bg-green-600/20 text-green-400',
  HOSTEL_MESS: 'bg-yellow-600/20 text-yellow-400',
  PROFESSORS: 'bg-blue-600/20 text-blue-400',
  MENTAL_HEALTH: 'bg-purple-600/20 text-purple-400',
  CAMPUS_LIFE: 'bg-pink-600/20 text-pink-400',
  SPORTS: 'bg-cyan-600/20 text-cyan-400',
  RESTRICTIONS: 'bg-red-600/20 text-red-400',
  INFRASTRUCTURE: 'bg-orange-600/20 text-orange-400',
  NEWS_CONTROVERSY: 'bg-rose-600/20 text-rose-400',
}

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: 'bg-emerald-500/15 text-emerald-400',
  NEGATIVE: 'bg-red-500/15 text-red-400',
  NEUTRAL: 'bg-zinc-500/15 text-zinc-400',
}

const SOURCE_COLORS: Record<string, string> = {
  reddit: 'bg-orange-500/15 text-orange-400',
  youtube: 'bg-red-500/15 text-red-400',
  user_submission: 'bg-indigo-500/15 text-indigo-400',
  quora: 'bg-red-600/15 text-red-300',
  shiksha: 'bg-blue-500/15 text-blue-400',
  collegedunia: 'bg-teal-500/15 text-teal-400',
  news: 'bg-zinc-500/15 text-zinc-400',
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatSource(source: string) {
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getThreadTitle(title: string): string {
  return title.replace(/^Re:\s*/i, '').trim()
}

function groupPostsByThread(posts: Post[]): (Post | ThreadGroup)[] {
  const threadMap = new Map<string, ThreadGroup>()
  const standalone: Post[] = []

  for (const post of posts) {
    if (post.title.startsWith('Re: ')) {
      const threadTitle = getThreadTitle(post.title)
      if (!threadMap.has(threadTitle)) {
        threadMap.set(threadTitle, { threadTitle, mainPost: null, comments: [] })
      }
      threadMap.get(threadTitle)!.comments.push(post)
    } else {
      // Check if this is a parent post that has Re: children
      const normalizedTitle = post.title.trim()
      if (threadMap.has(normalizedTitle)) {
        threadMap.get(normalizedTitle)!.mainPost = post
      } else {
        // Check if any future Re: posts match
        standalone.push(post)
      }
    }
  }

  // Second pass: match standalone posts to threads
  for (let i = standalone.length - 1; i >= 0; i--) {
    const post = standalone[i]
    const normalizedTitle = post.title.trim()
    if (threadMap.has(normalizedTitle)) {
      threadMap.get(normalizedTitle)!.mainPost = post
      standalone.splice(i, 1)
    }
  }

  // Build final list: standalone posts + thread groups (sorted by first post date)
  const result: (Post | ThreadGroup)[] = []

  // Add thread groups
  for (const group of threadMap.values()) {
    if (group.comments.length > 0) {
      result.push(group)
    }
  }

  // Add standalone posts
  for (const post of standalone) {
    result.push(post)
  }

  // Sort by most recent post date
  result.sort((a, b) => {
    const dateA = 'comments' in a
      ? new Date(a.comments[0]?.createdAt || '').getTime()
      : new Date(a.createdAt).getTime()
    const dateB = 'comments' in b
      ? new Date(b.comments[0]?.createdAt || '').getTime()
      : new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  return result
}

function isThreadGroup(item: Post | ThreadGroup): item is ThreadGroup {
  return 'comments' in item && 'threadTitle' in item
}

export default function AdminCollegeDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const [token, setToken] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<string | null>('pending')

  const pendingGrouped = useMemo(() => groupPostsByThread(pendingPosts), [pendingPosts])
  const approvedGrouped = useMemo(() => groupPostsByThread(approvedPosts), [approvedPosts])

  const fetchPosts = useCallback(async (authToken: string) => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`/api/admin/colleges/${slug}/posts?status=pending`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`/api/admin/colleges/${slug}/posts?status=approved`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ])

      if (pendingRes.status === 401) {
        sessionStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      const pendingData = await pendingRes.json()
      const approvedData = await approvedRes.json()

      if (pendingData.success) {
        setPendingPosts(pendingData.data)
        if (pendingData.data.length > 0) {
          setCollegeName(pendingData.data[0].collegeName)
        }
      }
      if (approvedData.success) {
        setApprovedPosts(approvedData.data)
        if (!collegeName && approvedData.data.length > 0) {
          setCollegeName(approvedData.data[0].collegeName)
        }
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
    }
  }, [slug, router, collegeName])

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token')
    if (!stored) {
      router.push('/admin/login')
      return
    }
    setToken(stored)
    fetchPosts(stored)
  }, [router, fetchPosts])

  async function handleApprove(postId: string) {
    setActionLoading(postId)
    try {
      const res = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const post = pendingPosts.find((p) => p._id === postId)
        if (post) {
          setPendingPosts((prev) => prev.filter((p) => p._id !== postId))
          setApprovedPosts((prev) => [{ ...post, isApproved: true, verified: true }, ...prev])
        }
      }
    } catch (err) {
      console.error('Failed to approve:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(postId: string) {
    setActionLoading(postId)
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setPendingPosts((prev) => prev.filter((p) => p._id !== postId))
        setApprovedPosts((prev) => prev.filter((p) => p._id !== postId))
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleBulkApprove() {
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/posts/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ collegeSlug: slug }),
      })
      if (res.ok) {
        setApprovedPosts((prev) => [
          ...pendingPosts.map((p) => ({ ...p, isApproved: true, verified: true })),
          ...prev,
        ])
        setPendingPosts([])
      }
    } catch (err) {
      console.error('Failed to bulk approve:', err)
    } finally {
      setBulkLoading(false)
    }
  }

  function toggleExpand(postId: string) {
    setExpandedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  function toggleThread(threadTitle: string) {
    setExpandedThreads((prev) => {
      const next = new Set(prev)
      if (next.has(threadTitle)) next.delete(threadTitle)
      else next.add(threadTitle)
      return next
    })
  }

  function CommentRow({ post, showActions }: { post: Post; showActions: boolean }) {
    const isExpanded = expandedPosts.has(post._id)
    const isLong = post.content.length > 200

    return (
      <div className="border-l-2 border-zinc-700/50 pl-4 py-3">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge className={`${CATEGORY_COLORS[post.category] || 'bg-zinc-700 text-zinc-300'} text-xs`}>
            {formatCategory(post.category)}
          </Badge>
          <Badge className={`${SENTIMENT_COLORS[post.sentiment] || 'bg-zinc-700 text-zinc-300'} text-xs`}>
            {post.sentiment}
          </Badge>
          {post.upvotes > 0 && (
            <span className="text-zinc-500 text-xs">{post.upvotes} upvotes</span>
          )}
        </div>

        {/* Content */}
        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
          {isExpanded || !isLong ? post.content : post.content.slice(0, 200) + '...'}
        </p>
        {isLong && (
          <button
            className="text-indigo-400 text-xs mt-1 hover:underline inline-flex items-center gap-1"
            onClick={() => toggleExpand(post._id)}
          >
            {isExpanded ? <>Less <ChevronUp className="size-3" /></> : <>More <ChevronDown className="size-3" /></>}
          </button>
        )}

        {/* Meta + Actions */}
        <div className="flex items-center gap-3 mt-2 text-zinc-600 text-xs flex-wrap">
          <span>{post.author}</span>
          <span>{formatDate(post.createdAt)}</span>
          {post.sourceUrl && (
            <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}>
              Source <ExternalLink className="size-3" />
            </a>
          )}
          {showActions && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(post._id)}
                disabled={actionLoading === post._id}
                className="h-6 px-2 bg-green-600/15 text-green-400 hover:bg-green-600/25 border-green-600/20 text-xs"
              >
                <Check className="size-3" />
                {actionLoading === post._id ? '...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(post._id)}
                disabled={actionLoading === post._id}
                className="h-6 px-2 bg-red-600/15 text-red-400 hover:bg-red-600/25 border-red-600/20 text-xs"
              >
                <Trash2 className="size-3" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  function ThreadCard({ group, showActions }: { group: ThreadGroup; showActions: boolean }) {
    const isOpen = expandedThreads.has(group.threadTitle)
    const totalComments = group.comments.length + (group.mainPost ? 1 : 0)

    return (
      <Card className="bg-zinc-900/50 border-zinc-800/60">
        <CardContent className="pt-4 pb-4">
          {/* Thread header - clickable to expand */}
          <button
            onClick={() => toggleThread(group.threadTitle)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-500/15 text-orange-400 text-xs">Reddit</Badge>
              <Badge className="bg-indigo-500/15 text-indigo-400 text-xs">
                <MessageSquare className="size-3 mr-1" />
                {totalComments} comments
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-white font-medium text-sm">{group.threadTitle}</h4>
              {isOpen ? (
                <ChevronUp className="size-4 text-zinc-500 shrink-0" />
              ) : (
                <ChevronDown className="size-4 text-zinc-500 shrink-0" />
              )}
            </div>
          </button>

          {/* Expanded: show all comments */}
          {isOpen && (
            <div className="mt-4 space-y-1">
              {group.mainPost && (
                <CommentRow post={group.mainPost} showActions={showActions} />
              )}
              {group.comments.map((comment) => (
                <CommentRow key={comment._id} post={comment} showActions={showActions} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  function PostCard({ post, showActions }: { post: Post; showActions: boolean }) {
    const isExpanded = expandedPosts.has(post._id)
    const isLong = post.content.length > 300

    return (
      <Card className="bg-zinc-900/50 border-zinc-800/60">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge className={`${SOURCE_COLORS[post.source] || 'bg-zinc-700 text-zinc-300'} text-xs`}>
              {formatSource(post.source)}
            </Badge>
            <Badge className={`${CATEGORY_COLORS[post.category] || 'bg-zinc-700 text-zinc-300'} text-xs`}>
              {formatCategory(post.category)}
            </Badge>
            <Badge className={`${SENTIMENT_COLORS[post.sentiment] || 'bg-zinc-700 text-zinc-300'} text-xs`}>
              {post.sentiment}
            </Badge>
            {post.upvotes > 0 && (
              <span className="text-zinc-500 text-xs">{post.upvotes} upvotes</span>
            )}
          </div>

          {post.title && (
            <h4 className="text-white font-medium text-sm mb-2">{post.title}</h4>
          )}

          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
            {isExpanded || !isLong ? post.content : post.content.slice(0, 300) + '...'}
          </p>
          {isLong && (
            <button
              className="text-indigo-400 text-xs mt-1 hover:underline inline-flex items-center gap-1"
              onClick={() => toggleExpand(post._id)}
            >
              {isExpanded ? <>Show less <ChevronUp className="size-3" /></> : <>Show more <ChevronDown className="size-3" /></>}
            </button>
          )}

          <div className="flex items-center gap-3 mt-3 text-zinc-600 text-xs flex-wrap">
            <span>{post.author}</span>
            <span>{formatDate(post.createdAt)}</span>
            {post.sourceUrl && (
              <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}>
                Source <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800/60">
              <Button
                size="sm"
                onClick={() => handleApprove(post._id)}
                disabled={actionLoading === post._id}
                className="bg-green-600/15 text-green-400 hover:bg-green-600/25 border-green-600/20"
              >
                <Check className="size-3.5" />
                {actionLoading === post._id ? '...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(post._id)}
                disabled={actionLoading === post._id}
                className="bg-red-600/15 text-red-400 hover:bg-red-600/25 border-red-600/20"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  function PostList({ items, showActions }: { items: (Post | ThreadGroup)[]; showActions: boolean }) {
    return (
      <div className="space-y-3">
        {items.map((item) => {
          if (isThreadGroup(item)) {
            return <ThreadCard key={item.threadTitle} group={item} showActions={showActions} />
          }
          return <PostCard key={item._id} post={item} showActions={showActions} />
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-zinc-400 text-lg">Loading posts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-zinc-800/60 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin')}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">
              {collegeName || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </h1>
            <p className="text-zinc-500 text-sm">
              {pendingPosts.length} pending, {approvedPosts.length} approved
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <TabsList className="bg-zinc-900 border border-zinc-800/60">
              <TabsTrigger value="pending" className="data-active:bg-zinc-800">
                Pending Review
                {pendingPosts.length > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs ml-1.5">
                    {pendingPosts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-active:bg-zinc-800">
                Approved
                <Badge className="bg-green-500/20 text-green-400 text-xs ml-1.5">
                  {approvedPosts.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {activeTab === 'pending' && pendingPosts.length > 1 && (
              <Button
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <CheckCheck className="size-3.5" />
                {bulkLoading ? 'Approving...' : `Approve All (${pendingPosts.length})`}
              </Button>
            )}
          </div>

          <TabsContent value="pending">
            {pendingGrouped.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800/60">
                <CardContent className="py-12 text-center">
                  <CheckCheck className="size-10 text-green-500/30 mx-auto mb-3" />
                  <p className="text-zinc-500">No pending posts for review</p>
                </CardContent>
              </Card>
            ) : (
              <PostList items={pendingGrouped} showActions={true} />
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedGrouped.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800/60">
                <CardContent className="py-12 text-center">
                  <p className="text-zinc-500">No approved posts yet</p>
                </CardContent>
              </Card>
            ) : (
              <PostList items={approvedGrouped} showActions={false} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
