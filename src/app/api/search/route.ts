import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    if (!q || q.length < 2) {
      return Response.json({ success: true, data: [] })
    }

    const colleges = await College.find({
      name: { $regex: q, $options: 'i' },
    })
      .select('name slug city state type overallScore totalPosts categories')
      .limit(10)
      .lean()

    return Response.json({ success: true, data: colleges })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
