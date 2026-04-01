import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'

const INCIDENT_REGEX = /suicid|death|died|kill.*self|jump.*building|hang.*self|end.*life|took.*life|passed away|lost.*life/i

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug } = await params

    // Find posts mentioning suicide/death for this college
    const posts = await Post.find({
      collegeSlug: slug,
      $or: [
        { content: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
        { title: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
      ],
    })
      .select('title content source sourceUrl author createdAt sentiment category')
      .sort({ createdAt: -1 })
      .lean()

    // Filter more precisely in JS (regex in MongoDB is limited)
    const filtered = posts.filter((p: any) => {
      const text = `${p.title || ''} ${p.content || ''}`
      return INCIDENT_REGEX.test(text)
    })

    // Extract year from each post for timeline
    const byYear: Record<string, number> = {}
    for (const p of filtered) {
      const year = p.createdAt
        ? new Date(p.createdAt as Date).getFullYear().toString()
        : 'Unknown'
      byYear[year] = (byYear[year] || 0) + 1
    }

    return Response.json({
      success: true,
      data: {
        total: filtered.length,
        byYear,
        incidents: filtered.map((p: any) => ({
          _id: p._id.toString(),
          title: p.title,
          content: p.content?.slice(0, 500),
          source: p.source,
          sourceUrl: p.sourceUrl,
          author: p.author,
          date: p.createdAt,
          sentiment: p.sentiment,
        })),
      },
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
