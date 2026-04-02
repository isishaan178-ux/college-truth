'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Newspaper,
  MessageCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from 'recharts'

interface TimelinePoint {
  year: number
  news: number
  reddit: number
  total: number
  sources: string[]
}

interface IncidentItem {
  _id: string
  title: string
  content: string
  source: string
  sourceUrl: string
  date: string | null
  year: number | null
  type: 'news' | 'reddit'
  verified: boolean
}

interface IncidentData {
  total: number
  newsCount: number
  redditCount: number
  timeline: TimelinePoint[]
  incidents: IncidentItem[]
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Date unknown'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload as TimelinePoint
  if (!data) return null

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl text-sm">
      <p className="font-bold text-zinc-100 mb-2">{label}</p>
      <div className="space-y-1">
        {data.news > 0 && (
          <div className="flex items-center gap-2">
            <Newspaper className="size-3 text-red-400" />
            <span className="text-red-300">News reports: {data.news}</span>
          </div>
        )}
        {data.reddit > 0 && (
          <div className="flex items-center gap-2">
            <MessageCircle className="size-3 text-orange-400" />
            <span className="text-orange-300">Reddit mentions: {data.reddit}</span>
          </div>
        )}
        <div className="border-t border-zinc-700 pt-1 mt-1">
          <span className="text-zinc-300 font-semibold">Total: {data.total}</span>
        </div>
      </div>
      {data.sources.length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-700">
          <p className="text-xs text-zinc-500 mb-1">Sources:</p>
          <div className="flex flex-wrap gap-1">
            {data.sources.map((s) => (
              <span
                key={s}
                className="inline-block text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props
  if (!payload || !cx || !cy) return null
  const total = payload.total || 0
  // Bigger dot for more incidents
  const r = Math.min(4 + total * 1.5, 12)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="#ef4444"
      stroke="#991b1b"
      strokeWidth={2}
      opacity={0.9}
    />
  )
}

export function IncidentsSection({ slug }: { slug: string }) {
  const [data, setData] = useState<IncidentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'news' | 'reddit'>('all')

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

  const filteredIncidents = data.incidents.filter((inc) => {
    if (filter === 'all') return true
    return inc.type === filter
  })

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
            {data.total} reports
          </Badge>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Data from verified news outlets and Reddit mentions. News reports are marked as verified.
        </p>
        {/* Source breakdown */}
        <div className="flex gap-3 mt-2">
          {data.newsCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Newspaper className="size-3.5 text-red-400" />
              <span className="text-xs text-red-300 font-medium">{data.newsCount} news</span>
            </div>
          )}
          {data.redditCount > 0 && (
            <div className="flex items-center gap-1.5">
              <MessageCircle className="size-3.5 text-orange-400" />
              <span className="text-xs text-orange-300 font-medium">{data.redditCount} reddit</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── X/Y Axis Chart ── */}
        {data.timeline.length > 0 && (
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
            <h4 className="text-sm font-medium text-zinc-300 mb-3">
              Incident Reports Over Time
            </h4>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={data.timeline}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="newsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="redditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#a1a1aa', fontSize: 12 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={{ stroke: '#3f3f46' }}
                  label={{
                    value: 'Reports',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#71717a', fontSize: 11 },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="news"
                  name="News Reports"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#newsGrad)"
                  dot={<CustomDot />}
                  activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="reddit"
                  name="Reddit Mentions"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#redditGrad)"
                  dot={{ r: 3, fill: '#f97316', stroke: '#7c2d12', strokeWidth: 1 }}
                  activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Filter + Expand sources ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
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
        </div>

        {expanded && (
          <>
            {/* Filter tabs */}
            <div className="flex gap-2">
              {(['all', 'news', 'reddit'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    filter === f
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-zinc-800/50'
                  }`}
                >
                  {f === 'all'
                    ? `All (${data.total})`
                    : f === 'news'
                    ? `News (${data.newsCount})`
                    : `Reddit (${data.redditCount})`}
                </button>
              ))}
            </div>

            {/* Incident list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredIncidents.map((incident) => {
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
                          {incident.type === 'news' ? (
                            <Badge className="bg-red-500/15 text-red-400 text-xs gap-1">
                              <Newspaper className="size-3" />
                              {incident.source}
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-500/15 text-orange-400 text-xs gap-1">
                              <MessageCircle className="size-3" />
                              Reddit
                            </Badge>
                          )}
                          {incident.verified && (
                            <Badge className="bg-green-500/15 text-green-400 text-xs">
                              Verified
                            </Badge>
                          )}
                          <span className="text-xs text-zinc-500">
                            {formatDate(incident.date)}
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
              {filteredIncidents.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">
                  No {filter} reports found.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
