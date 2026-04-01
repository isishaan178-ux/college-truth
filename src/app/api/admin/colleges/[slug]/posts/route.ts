import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    await connectDB()
    const { slug } = await params

    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const filter: Record<string, any> = { collegeSlug: slug }

    if (status === 'pending') {
      filter.isApproved = false
    } else if (status === 'approved') {
      filter.isApproved = true
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return Response.json({ success: true, data: posts })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
