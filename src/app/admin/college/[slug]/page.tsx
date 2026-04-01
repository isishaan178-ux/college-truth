'use client'

import { useEffect, useState, useCallback, use } from 'react'
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
  const [activeTab, setActiveTab] = useState<string | null>('pending')

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
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  function PostCard({ post, showActions }: { post: Post; showActions: boolean }) {
    const isExpanded = expandedPosts.has(post._id)
    const isLong = post.content.length > 300

    return (
      <Card className="bg-zinc-900/50 border-zinc-800/60">
        <CardContent className="pt-4 pb-4">
          {/* Badges row */}
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

          {/* Title */}
          {post.title && (
            <h4 className="text-white font-medium text-sm mb-2">{post.title}</h4>
          )}

          {/* Content */}
          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
            {isExpanded || !isLong ? post.content : post.content.slice(0, 300) + '...'}
          </p>
          {isLong && (
            <button
              className="text-indigo-400 text-xs mt-1 hover:underline inline-flex items-center gap-1"
              onClick={() => toggleExpand(post._id)}
            >
              {isExpanded ? (
                <>Show less <ChevronUp className="size-3" /></>
              ) : (
                <>Show more <ChevronDown className="size-3" /></>
              )}
            </button>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-3 text-zinc-600 text-xs flex-wrap">
            <span>{post.author}</span>
            <span>{formatDate(post.createdAt)}</span>
            {post.sourceUrl && (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Source <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          {/* Action buttons */}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-zinc-400 text-lg">Loading posts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
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
            {pendingPosts.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800/60">
                <CardContent className="py-12 text-center">
                  <CheckCheck className="size-10 text-green-500/30 mx-auto mb-3" />
                  <p className="text-zinc-500">No pending posts for review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map((post) => (
                  <PostCard key={post._id} post={post} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedPosts.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800/60">
                <CardContent className="py-12 text-center">
                  <p className="text-zinc-500">No approved posts yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {approvedPosts.map((post) => (
                  <PostCard key={post._id} post={post} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
