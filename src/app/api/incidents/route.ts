import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import College from '@/lib/models/College'

export const revalidate = 300

export async function GET() {
  try {
    await connectDB()

    const posts = await Post.find({
      $or: [
        { content: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
        { title: { $regex: 'suicid|death|died|killed|jump|hanging|passed away|lost life|took life|end life', $options: 'i' } },
      ],
    })
      .select('collegeSlug collegeName createdAt')
      .lean()

    // Filter precisely
    const regex = /suicid|death|died|kill.*self|jump.*building|hang.*self|end.*life|took.*life|passed away|lost.*life/i
    const filtered = posts.filter((p: any) => {
      const text = `${p.title || ''} ${p.content || ''}`
      return regex.test(text)
    })

    // Group by college
    const byCollege: Record<string, { name: string; slug: string; count: number }> = {}
    for (const p of filtered) {
      const slug = (p as any).collegeSlug
      if (!byCollege[slug]) {
        byCollege[slug] = {
          name: (p as any).collegeName,
          slug,
          count: 0,
        }
      }
      byCollege[slug].count += 1
    }

    const sorted = Object.values(byCollege).sort((a, b) => b.count - a.count)

    return Response.json({
      success: true,
      data: {
        total: filtered.length,
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
