'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Search, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface CollegeCategory {
  score: number
  count: number
}

interface College {
  _id: string
  name: string
  slug: string
  city: string
  state: string
  type: string
  overallScore: number
  totalPosts: number
  categories: {
    placements: CollegeCategory
    hostel: CollegeCategory
    mess: CollegeCategory
    professors: CollegeCategory
    mentalHealth: CollegeCategory
    campusLife: CollegeCategory
    sports: CollegeCategory
    restrictions: CollegeCategory
    infrastructure: CollegeCategory
  }
}

const categoryLabels: Record<string, string> = {
  placements: 'Placements',
  hostel: 'Hostel',
  mess: 'Mess Food',
  professors: 'Professors',
  mentalHealth: 'Mental Health',
  campusLife: 'Campus Life',
  sports: 'Sports',
  restrictions: 'Restrictions',
  infrastructure: 'Infrastructure',
}

function ScoreBar({ score, best }: { score: number; best: boolean }) {
  const pct = (score / 10) * 100
  const color = score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-semibold w-8 ${best ? 'text-green-400' : ''}`}>{score > 0 ? score.toFixed(1) : '-'}</span>
    </div>
  )
}

export default function ComparePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<College[]>([])
  const [selectedColleges, setSelectedColleges] = useState<College[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        if (data.success) setSearchResults(data.data || [])
      } catch { /* ignore */ }
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const addCollege = (college: College) => {
    if (selectedColleges.length >= 3) return
    if (selectedColleges.find((c) => c._id === college._id)) return
    setSelectedColleges([...selectedColleges, college])
    setSearchQuery('')
    setSearchResults([])
  }

  const removeCollege = (id: string) => {
    setSelectedColleges(selectedColleges.filter((c) => c._id !== id))
  }

  const getBest = (catKey: string) => {
    let best = -1
    let bestIdx = -1
    selectedColleges.forEach((c, i) => {
      const score = (c.categories as any)[catKey]?.score || 0
      if (score > best) { best = score; bestIdx = i }
    })
    return bestIdx
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            Compare <span className="text-indigo-400">Colleges</span>
          </h1>
          <p className="text-muted-foreground">
            Select up to 3 colleges to compare side by side across all categories
          </p>
        </div>

        {/* Search to add */}
        {selectedColleges.length < 3 && (
          <div className="max-w-md mx-auto relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search college to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {searchResults.map((college) => (
                  <button
                    key={college._id}
                    onClick={() => addCollege(college)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="font-medium">{college.name}</p>
                      <p className="text-xs text-muted-foreground">{college.city}, {college.state}</p>
                    </div>
                    <Plus className="w-4 h-4 text-indigo-400" />
                  </button>
                ))}
              </div>
            )}
            {searching && <p className="text-xs text-muted-foreground mt-2 text-center">Searching...</p>}
          </div>
        )}

        {/* Selected colleges chips */}
        {selectedColleges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {selectedColleges.map((c, i) => (
              <Badge key={c._id} variant="outline" className="py-2 px-4 gap-2 text-sm">
                <span className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {c.name}
                <button onClick={() => removeCollege(c._id)}>
                  <X className="w-3.5 h-3.5 hover:text-red-400 transition-colors" />
                </button>
              </Badge>
            ))}
            {selectedColleges.length < 3 && (
              <Badge variant="outline" className="py-2 px-4 text-sm text-muted-foreground border-dashed">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add College
              </Badge>
            )}
          </div>
        )}

        {/* Empty state */}
        {selectedColleges.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">Search and add colleges above to start comparing</p>
            </CardContent>
          </Card>
        )}

        {/* Comparison table */}
        {selectedColleges.length >= 2 && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Truth Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedColleges.length}, 1fr)` }}>
                  {selectedColleges.map((c, i) => {
                    const bestOverall = selectedColleges.reduce((best, curr) => curr.overallScore > best.overallScore ? curr : best)
                    const isBest = c._id === bestOverall._id
                    return (
                      <div key={c._id} className={`text-center p-4 rounded-lg ${isBest ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/30'}`}>
                        <p className={`text-4xl font-bold ${isBest ? 'text-green-400' : ''}`}>
                          {c.overallScore > 0 ? c.overallScore.toFixed(1) : '-'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">/10</p>
                        <p className="font-medium mt-2">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.totalPosts} reviews</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Category by category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(categoryLabels).map(([key, label]) => {
                  const bestIdx = getBest(key)
                  return (
                    <div key={key}>
                      <p className="text-sm font-medium mb-3">{label}</p>
                      <div className="space-y-2">
                        {selectedColleges.map((c, i) => (
                          <div key={c._id} className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-xs w-24 truncate text-muted-foreground">{c.name}</span>
                            <div className="flex-1">
                              <ScoreBar score={(c.categories as any)[key]?.score || 0} best={i === bestIdx} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick verdict */}
            <Card className="border-indigo-500/30 bg-indigo-500/5">
              <CardHeader>
                <CardTitle className="text-lg">Quick Verdict</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedColleges.length}, 1fr)` }}>
                  {selectedColleges.map((c) => {
                    const cats = c.categories || {}
                    const withScores = Object.entries(cats).filter(([, v]) => (v as CollegeCategory).score > 0)
                    const best = withScores.length > 0
                      ? withScores.reduce((a, b) => ((b[1] as CollegeCategory).score > (a[1] as CollegeCategory).score ? b : a))
                      : null
                    const worst = withScores.length > 1
                      ? withScores.reduce((a, b) => ((b[1] as CollegeCategory).score < (a[1] as CollegeCategory).score ? b : a))
                      : null
                    return (
                      <div key={c._id} className="space-y-2">
                        <p className="font-medium text-sm">{c.name}</p>
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Best:</span>
                          <span>{best ? (categoryLabels[best[0]] || best[0]) : 'No data'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-red-400">Worst:</span>
                          <span>{worst ? (categoryLabels[worst[0]] || worst[0]) : 'No data'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Only 1 selected */}
        {selectedColleges.length === 1 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Add at least one more college to compare</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
