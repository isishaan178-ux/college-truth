import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import Post from '@/lib/models/Post'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug } = await params

    const college = await College.findOne({ slug }).lean()
    if (!college) {
      return Response.json(
        { success: false, error: 'College not found' },
        { status: 404 }
      )
    }

    const posts = await Post.find({ collegeSlug: slug, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    // Group posts by category
    const postsByCategory: Record<string, typeof posts> = {}
    for (const post of posts) {
      const cat = post.category
      if (!postsByCategory[cat]) {
        postsByCategory[cat] = []
      }
      postsByCategory[cat].push(post)
    }

    return Response.json({
      success: true,
      data: {
        college,
        postsByCategory,
      },
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
