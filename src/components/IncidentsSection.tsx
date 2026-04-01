'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, ChevronDown, ChevronUp, AlertTriangle, BarChart3 } from 'lucide-react'

interface Incident {
  _id: string
  title: string
  content: string
  source: string
  sourceUrl: string
  author: string
  date: string
  sentiment: string
}

interface IncidentData {
  total: number
  byYear: Record<string, number>
  incidents: Incident[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function IncidentsSection({ slug }: { slug: string }) {
  const [data, setData] = useState<IncidentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/colleges/${slug}/incidents`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading || !data || data.total === 0) return null

  const years = Object.entries(data.byYear).sort(([a], [b]) => a.localeCompare(b))
  const maxCount = Math.max(...years.map(([, c]) => c))

  function toggleItem(id: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-400" />
          <CardTitle className="text-lg text-red-300">
            Reported Suicide & Death Incidents
          </CardTitle>
          <Badge className="bg-red-500/20 text-red-400 text-xs ml-auto">
            {data.total} reports found
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Based on mentions found in Reddit posts and comments. These are unverified student reports, not confirmed statistics.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year-wise bar chart */}
        {years.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="size-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Reports by Year</span>
            </div>
            <div className="space-y-2">
              {years.map(([year, count]) => {
                const pct = (count / maxCount) * 100
                return (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-12 text-right font-mono">{year}</span>
                    <div className="flex-1 h-6 rounded bg-zinc-800/50 overflow-hidden relative">
                      <div
                        className="h-full rounded bg-gradient-to-r from-red-600/60 to-red-500/80 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-red-300">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Expand to see sources */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
        >
          <span className="text-sm text-zinc-300">
            View {data.incidents.length} source reports
          </span>
          {expanded ? (
            <ChevronUp className="size-4 text-zinc-400" />
          ) : (
            <ChevronDown className="size-4 text-zinc-400" />
          )}
        </button>

        {expanded && (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {data.incidents.map((incident) => {
              const isOpen = expandedItems.has(incident._id)
              const isLong = incident.content.length > 200
              return (
                <div
                  key={incident._id}
                  className="border border-zinc-800/60 rounded-lg p-3 bg-zinc-900/30"
                >
                  <div className="flex items-start gap-2 justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className="bg-orange-500/15 text-orange-400 text-xs">
                          {incident.source}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {formatDate(incident.date)}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {incident.author}
                        </span>
                      </div>
                      {incident.title && (
                        <p className="text-sm font-medium text-zinc-200 mb-1">
                          {incident.title}
                        </p>
                      )}
                      <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                        {isOpen || !isLong
                          ? incident.content
                          : incident.content.slice(0, 200) + '...'}
                      </p>
                      {isLong && (
                        <button
                          className="text-indigo-400 text-xs mt-1 hover:underline"
                          onClick={() => toggleItem(incident._id)}
                        >
                          {isOpen ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    {incident.sourceUrl && (
                      <a
                        href={incident.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-red-400 hover:text-red-300"
                        title="View source"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
