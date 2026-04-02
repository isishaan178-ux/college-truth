import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import Incident from '@/lib/models/Incident'

const INCIDENT_REGEX = /suicid|death|died|kill.*self|jump.*building|hang.*self|end.*life|took.*life|passed away|lost.*life/i

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug } = await params

    // ── 1. News incidents from incidents collection ──
    const newsIncidents = await Incident.find({ collegeSlug: slug })
      .select('title content sourceName sourceUrl date type verified')
      .sort({ date: -1 })
      .lean()

    // ── 2. Reddit posts mentioning suicide/death ──
    const redditPosts = await Post.find({
      collegeSlug: slug,
      $or: [
        { content: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
        { title: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
      ],
    })
      .select('title content source sourceUrl author createdAt sentiment')
      .sort({ createdAt: -1 })
      .lean()

    // Filter Reddit posts more precisely
    const filteredReddit = redditPosts.filter((p: any) => {
      const text = `${p.title || ''} ${p.content || ''}`
      return INCIDENT_REGEX.test(text)
    })

    // ── 3. Normalize into unified format ──
    interface IncidentItem {
      _id: string
      title: string
      content: string
      source: string       // 'Reddit', 'NDTV', 'Times of India', etc.
      sourceUrl: string
      date: string | null
      year: number | null
      type: string          // 'news' | 'reddit'
      verified: boolean
    }

    const allIncidents: IncidentItem[] = []

    // Add news incidents
    for (const n of newsIncidents) {
      const d = n.date ? new Date(n.date as Date) : null
      allIncidents.push({
        _id: (n as any)._id.toString(),
        title: (n as any).title || '',
        content: ((n as any).content || '').slice(0, 500),
        source: (n as any).sourceName || 'News',
        sourceUrl: (n as any).sourceUrl || '',
        date: d ? d.toISOString() : null,
        year: d ? d.getFullYear() : null,
        type: 'news',
        verified: true,
      })
    }

    // Add Reddit posts
    for (const p of filteredReddit) {
      const d = p.createdAt ? new Date(p.createdAt as Date) : null
      allIncidents.push({
        _id: (p as any)._id.toString(),
        title: (p as any).title || '',
        content: ((p as any).content || '').slice(0, 500),
        source: 'Reddit',
        sourceUrl: (p as any).sourceUrl || '',
        date: d ? d.toISOString() : null,
        year: d ? d.getFullYear() : null,
        type: 'reddit',
        verified: false,
      })
    }

    // Sort by date descending
    allIncidents.sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    // ── 4. Build timeline data for chart ──
    // Group by year, count by source type
    const byYear: Record<string, { news: number; reddit: number; total: number; sources: string[] }> = {}
    for (const inc of allIncidents) {
      const yearKey = inc.year ? inc.year.toString() : 'Unknown'
      if (yearKey === 'Unknown') continue
      if (!byYear[yearKey]) {
        byYear[yearKey] = { news: 0, reddit: 0, total: 0, sources: [] }
      }
      byYear[yearKey].total += 1
      if (inc.type === 'news') {
        byYear[yearKey].news += 1
        if (inc.source && !byYear[yearKey].sources.includes(inc.source)) {
          byYear[yearKey].sources.push(inc.source)
        }
      } else {
        byYear[yearKey].reddit += 1
        if (!byYear[yearKey].sources.includes('Reddit')) {
          byYear[yearKey].sources.push('Reddit')
        }
      }
    }

    // Convert to sorted array for chart
    const timeline = Object.entries(byYear)
      .map(([year, data]) => ({
        year: parseInt(year),
        news: data.news,
        reddit: data.reddit,
        total: data.total,
        sources: data.sources,
      }))
      .sort((a, b) => a.year - b.year)

    return Response.json({
      success: true,
      data: {
        total: allIncidents.length,
        newsCount: newsIncidents.length,
        redditCount: filteredReddit.length,
        timeline,
        incidents: allIncidents,
      },
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
