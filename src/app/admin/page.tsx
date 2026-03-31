'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Stats {
  totalColleges: number
  totalPosts: number
  pendingSubmissions: number
  postsToday: number
  postsBySource: Record<string, number>
  postsByCategory: Record<string, number>
}

interface Submission {
  _id: string
  collegeName: string
  collegeSlug: string
  category: string
  content: string
  author: string
  email: string
  status: string
  adminNote: string
  createdAt: string
}

interface Post {
  _id: string
  collegeName: string
  category: string
  sentiment: string
  source: string
  content: string
  title: string
  author: string
  createdAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  PLACEMENTS: 'bg-green-600',
  HOSTEL_MESS: 'bg-yellow-600',
  PROFESSORS: 'bg-blue-600',
  MENTAL_HEALTH: 'bg-purple-600',
  CAMPUS_LIFE: 'bg-pink-600',
  SPORTS: 'bg-cyan-600',
  RESTRICTIONS: 'bg-red-600',
  INFRASTRUCTURE: 'bg-orange-600',
  NEWS_CONTROVERSY: 'bg-rose-700',
}

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: 'bg-emerald-600',
  NEGATIVE: 'bg-red-600',
  NEUTRAL: 'bg-zinc-600',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async (authToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` }

      const [statsRes, subsRes, postsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/submissions?status=pending&limit=50', { headers }),
        fetch('/api/posts?limit=20', { headers }),
      ])

      if (statsRes.status === 401) {
        sessionStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      const statsData = await statsRes.json()
      const subsData = await subsRes.json()
      const postsData = await postsRes.json()

      if (statsData.success) setStats(statsData.data)
      if (subsData.success) setSubmissions(subsData.data || [])
      if (postsData.success) setRecentPosts(postsData.data || [])
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token')
    if (!stored) {
      router.push('/admin/login')
      return
    }
    setToken(stored)
    fetchData(stored)
  }, [router, fetchData])

  async function handleApprove(submissionId: string) {
    setActionLoading(submissionId)
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s._id !== submissionId))
        fetchData(token)
      }
    } catch (err) {
      console.error('Failed to approve:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(submissionId: string) {
    setActionLoading(submissionId)
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject', adminNote: rejectNote }),
      })
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s._id !== submissionId))
        setRejectDialog(null)
        setRejectNote('')
        fetchData(token)
      }
    } catch (err) {
      console.error('Failed to reject:', err)
    } finally {
      setActionLoading(null)
    }
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

  function formatCategory(cat: string) {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-lg">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">College Sach Admin</h1>
            <p className="text-zinc-500 text-sm">Dashboard & Content Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(token)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem('admin_token')
                router.push('/admin/login')
              }}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <p className="text-zinc-500 text-sm">Total Colleges</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.totalColleges || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <p className="text-zinc-500 text-sm">Total Posts</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.totalPosts || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <p className="text-zinc-500 text-sm">Pending Submissions</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">
                  {stats?.pendingSubmissions || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <p className="text-zinc-500 text-sm">Posts Today</p>
                <p className="text-3xl font-bold text-green-400 mt-1">
                  {stats?.postsToday || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Posts by Source & Category */}
        {stats && (
          <section className="grid md:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-300 text-base">Posts by Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.postsBySource).length === 0 ? (
                  <p className="text-zinc-500 text-sm">No data yet</p>
                ) : (
                  Object.entries(stats.postsBySource).map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm capitalize">{source}</span>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-300 text-base">Posts by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats.postsByCategory).length === 0 ? (
                  <p className="text-zinc-500 text-sm">No data yet</p>
                ) : (
                  Object.entries(stats.postsByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <Badge className={`${CATEGORY_COLORS[category] || 'bg-zinc-700'} text-white text-xs`}>
                        {formatCategory(category)}
                      </Badge>
                      <span className="text-zinc-400 text-sm">{count}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Pending Submissions */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">
            Pending Submissions ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center">
                <p className="text-zinc-500">No pending submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub._id} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-medium text-white">{sub.collegeName}</span>
                          <Badge className={`${CATEGORY_COLORS[sub.category] || 'bg-zinc-700'} text-white text-xs`}>
                            {formatCategory(sub.category)}
                          </Badge>
                          <span className="text-zinc-500 text-xs">
                            by {sub.author} | {formatDate(sub.createdAt)}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                          {expandedSubmission === sub._id
                            ? sub.content
                            : sub.content.length > 200
                              ? sub.content.slice(0, 200) + '...'
                              : sub.content}
                        </p>
                        {sub.content.length > 200 && (
                          <button
                            className="text-orange-400 text-xs mt-1 hover:underline"
                            onClick={() =>
                              setExpandedSubmission(
                                expandedSubmission === sub._id ? null : sub._id
                              )
                            }
                          >
                            {expandedSubmission === sub._id ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(sub._id)}
                          disabled={actionLoading === sub._id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {actionLoading === sub._id ? '...' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectDialog(sub._id)}
                          disabled={actionLoading === sub._id}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recent Posts */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Recent Posts</h2>
          {recentPosts.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center">
                <p className="text-zinc-500">No posts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <Card key={post._id} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-white text-sm">
                            {post.collegeName}
                          </span>
                          <Badge className={`${CATEGORY_COLORS[post.category] || 'bg-zinc-700'} text-white text-xs`}>
                            {formatCategory(post.category)}
                          </Badge>
                          <Badge className={`${SENTIMENT_COLORS[post.sentiment] || 'bg-zinc-700'} text-white text-xs`}>
                            {post.sentiment}
                          </Badge>
                          <Badge variant="outline" className="text-zinc-400 border-zinc-700 text-xs">
                            {post.source}
                          </Badge>
                        </div>
                        {post.title && (
                          <p className="text-zinc-300 text-sm font-medium">{post.title}</p>
                        )}
                        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">
                          {post.content}
                        </p>
                        <p className="text-zinc-600 text-xs mt-1">
                          {post.author} | {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Scraping Status */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Scraping Status</h2>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-zinc-500 text-sm">Reddit Scraper</p>
                  <p className="text-zinc-300 text-sm mt-1">
                    Runs daily via GitHub Actions at 6:00 AM IST
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Review Scraper</p>
                  <p className="text-zinc-300 text-sm mt-1">
                    CollegeDunia & Shiksha reviews
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Total Sources</p>
                  <p className="text-zinc-300 text-sm mt-1">
                    {stats ? Object.keys(stats.postsBySource).length : 0} active sources
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">
              Optionally add a note explaining the rejection:
            </p>
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog(null)
                setRejectNote('')
              }}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectDialog && handleReject(rejectDialog)}
              disabled={actionLoading === rejectDialog}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === rejectDialog ? 'Rejecting...' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
