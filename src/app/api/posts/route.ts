import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import College from '@/lib/models/College'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const collegeSlug = searchParams.get('collegeSlug') || ''
    const category = searchParams.get('category') || ''
    const sentiment = searchParams.get('sentiment') || ''
    const source = searchParams.get('source') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const filter: Record<string, any> = { isApproved: true }

    if (collegeSlug) filter.collegeSlug = collegeSlug
    if (category) filter.category = category
    if (sentiment) filter.sentiment = sentiment
    if (source) filter.source = source

    const skip = (page - 1) * limit
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ])

    return Response.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    await connectDB()

    const body = await request.json()
    const { collegeId, collegeName, collegeSlug, category, sentiment, source, sourceUrl, content, title, author } = body

    if (!content || !collegeSlug || !category) {
      return Response.json(
        { success: false, error: 'content, collegeSlug, and category are required' },
        { status: 400 }
      )
    }

    // Find the college
    const college = await College.findOne({ slug: collegeSlug })
    if (!college) {
      return Response.json(
        { success: false, error: 'College not found' },
        { status: 404 }
      )
    }

    const post = await Post.create({
      collegeId: collegeId || college._id,
      collegeName: collegeName || college.name,
      collegeSlug,
      category,
      sentiment: sentiment || 'NEUTRAL',
      source: source || 'user_submission',
      sourceUrl: sourceUrl || '',
      content,
      title: title || '',
      author: author || 'Anonymous',
      verified: false,
      isApproved: false,
    })

    // Update college totalPosts
    await College.findByIdAndUpdate(college._id, {
      $inc: { totalPosts: 1 },
    })

    return Response.json({ success: true, data: post }, { status: 201 })
  } catch (error: any) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
