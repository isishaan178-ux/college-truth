import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import Incident from '@/lib/models/Incident'

export const revalidate = 300

export async function GET() {
  try {
    await connectDB()

    // ── 1. News incidents ──
    const newsIncidents = await Incident.find({})
      .select('collegeSlug collegeName')
      .lean()

    // ── 2. Reddit posts mentioning suicide/death ──
    const posts = await Post.find({
      $or: [
        { content: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
        { title: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
      ],
    })
      .select('collegeSlug collegeName')
      .lean()

    const regex = /suicid|death|died|kill.*self|jump.*building|hang.*self|end.*life|took.*life|passed away|lost.*life/i
    const filteredPosts = posts.filter((p: any) => {
      const text = `${p.title || ''} ${p.content || ''}`
      return regex.test(text)
    })

    // ── 3. Group by college ──
    const byCollege: Record<string, { name: string; slug: string; news: number; reddit: number; total: number }> = {}

    for (const n of newsIncidents) {
      const slug = (n as any).collegeSlug
      if (!byCollege[slug]) {
        byCollege[slug] = { name: (n as any).collegeName, slug, news: 0, reddit: 0, total: 0 }
      }
      byCollege[slug].news += 1
      byCollege[slug].total += 1
    }

    for (const p of filteredPosts) {
      const slug = (p as any).collegeSlug
      if (!byCollege[slug]) {
        byCollege[slug] = { name: (p as any).collegeName, slug, news: 0, reddit: 0, total: 0 }
      }
      byCollege[slug].reddit += 1
      byCollege[slug].total += 1
    }

    const sorted = Object.values(byCollege).sort((a, b) => b.total - a.total)

    return Response.json({
      success: true,
      data: {
        total: newsIncidents.length + filteredPosts.length,
        colleges: sorted,
      },
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
