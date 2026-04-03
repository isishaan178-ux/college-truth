import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import { escapeRegex, stripMongoOps } from '@/lib/validate'

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const rawQ = searchParams.get('q') || ''
    const q = stripMongoOps(rawQ).slice(0, 200)

    if (!q || q.length < 2) {
      return Response.json({ success: true, data: [] })
    }

    const colleges = await College.find({
      name: { $regex: escapeRegex(q), $options: 'i' },
    })
      .select('name slug city state type overallScore totalPosts categories')
      .limit(10)
      .lean()

    return Response.json({ success: true, data: colleges })
  } catch (error: any) {
    console.error('Search error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
