import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import Post from '@/lib/models/Post'
import { slugSchema } from '@/lib/validate'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug: rawSlug } = await params
    const parsed = slugSchema.safeParse(rawSlug)
    if (!parsed.success) {
      return Response.json({ success: false, error: 'Invalid slug' }, { status: 400 })
    }
    const slug = parsed.data

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
    console.error('College slug GET error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
