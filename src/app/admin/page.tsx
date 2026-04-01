'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  RefreshCw,
  LogOut,
} from 'lucide-react'

interface CollegeWithCounts {
  _id: string
  name: string
  slug: string
  city: string
  state: string
  type: string
  overallScore: number
  pendingPosts: number
  approvedPosts: number
}

interface Totals {
  colleges: number
  posts: number
  pending: number
  approved: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [colleges, setColleges] = useState<CollegeWithCounts[]>([])
  const [totals, setTotals] = useState<Totals>({ colleges: 0, posts: 0, pending: 0, approved: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', city: '', state: '', type: 'private' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const fetchData = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/colleges', {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (res.status === 401) {
        sessionStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      const data = await res.json()
      if (data.success) {
        setColleges(data.data.colleges)
        setTotals(data.data.totals)
      }
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

  async function handleAddCollege() {
    if (!addForm.name || !addForm.city || !addForm.state || !addForm.type) {
      setAddError('All fields are required')
      return
    }

    setAddLoading(true)
    setAddError('')

    try {
      const res = await fetch('/api/admin/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addForm),
      })

      const data = await res.json()

      if (data.success) {
        setShowAddDialog(false)
        setAddForm({ name: '', city: '', state: '', type: 'private' })
        fetchData(token)
      } else {
        setAddError(data.error || 'Failed to add college')
      }
    } catch (err) {
      setAddError('Network error')
    } finally {
      setAddLoading(false)
    }
  }

  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const typeBadgeColor: Record<string, string> = {
    private: 'bg-blue-600/20 text-blue-400',
    government: 'bg-green-600/20 text-green-400',
    deemed: 'bg-purple-600/20 text-purple-400',
    autonomous: 'bg-amber-600/20 text-amber-400',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-zinc-400 text-lg">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              College Sach Admin
            </h1>
            <p className="text-zinc-500 text-sm">Dashboard & Content Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setLoading(true); fetchData(token) }}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RefreshCw className="size-3.5" />
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
              <LogOut className="size-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800/60">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Building2 className="size-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Total Colleges</p>
                  <p className="text-2xl font-bold text-white">{totals.colleges}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/60">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileText className="size-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Total Posts</p>
                  <p className="text-2xl font-bold text-white">{totals.posts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/60">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="size-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Pending Posts</p>
                  <p className="text-2xl font-bold text-orange-400">{totals.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/60">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="size-5 text-green-400" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Approved Posts</p>
                  <p className="text-2xl font-bold text-green-400">{totals.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Search + Add College */}
        <section className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <Input
              placeholder="Search colleges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="size-4" />
            Add College
          </Button>
        </section>

        {/* College Grid */}
        <section>
          {filteredColleges.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800/60">
              <CardContent className="py-12 text-center">
                <p className="text-zinc-500">
                  {searchQuery ? 'No colleges match your search' : 'No colleges yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredColleges.map((college) => (
                <Card
                  key={college._id}
                  className="bg-zinc-900/50 border-zinc-800/60 hover:border-indigo-500/30 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/admin/college/${college.slug}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-white group-hover:text-indigo-300 transition-colors text-base leading-snug">
                        {college.name}
                      </CardTitle>
                      <Badge className={`${typeBadgeColor[college.type] || 'bg-zinc-700 text-zinc-300'} text-xs shrink-0 capitalize`}>
                        {college.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-zinc-500 text-sm mb-3">{college.city}, {college.state}</p>
                    <div className="flex items-center gap-2">
                      {college.pendingPosts > 0 && (
                        <Badge className="bg-orange-500/15 text-orange-400 text-xs">
                          {college.pendingPosts} pending
                        </Badge>
                      )}
                      <Badge className="bg-green-500/15 text-green-400 text-xs">
                        {college.approvedPosts} approved
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add College Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New College</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {addError && (
              <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{addError}</p>
            )}
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">College Name</label>
              <Input
                placeholder="e.g. Indian Institute of Technology Delhi"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {addForm.name && (
                <p className="text-zinc-600 text-xs mt-1">
                  Slug: {addForm.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">City</label>
                <Input
                  placeholder="e.g. New Delhi"
                  value={addForm.city}
                  onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">State</label>
                <Input
                  placeholder="e.g. Delhi"
                  value={addForm.state}
                  onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Type</label>
              <Select
                value={addForm.type}
                onValueChange={(val) => setAddForm({ ...addForm, type: val as string })}
              >
                <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="deemed">Deemed</SelectItem>
                  <SelectItem value="autonomous">Autonomous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false)
                setAddForm({ name: '', city: '', state: '', type: 'private' })
                setAddError('')
              }}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCollege}
              disabled={addLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {addLoading ? 'Adding...' : 'Add College'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
