import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import Post from '@/lib/models/Post'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    await connectDB()

    const colleges = await College.find().sort({ name: 1 }).lean()

    // Get pending and approved counts per college
    const postCounts = await Post.aggregate([
      {
        $group: {
          _id: { collegeSlug: '$collegeSlug', isApproved: '$isApproved' },
          count: { $sum: 1 },
        },
      },
    ])

    // Build a map: slug -> { pending, approved }
    const countsMap: Record<string, { pending: number; approved: number }> = {}
    for (const item of postCounts) {
      const slug = item._id.collegeSlug
      if (!countsMap[slug]) countsMap[slug] = { pending: 0, approved: 0 }
      if (item._id.isApproved) {
        countsMap[slug].approved = item.count
      } else {
        countsMap[slug].pending = item.count
      }
    }

    const collegesWithCounts = colleges.map((college) => ({
      _id: college._id,
      name: college.name,
      slug: college.slug,
      city: college.city,
      state: college.state,
      type: college.type,
      overallScore: college.overallScore,
      pendingPosts: countsMap[college.slug]?.pending || 0,
      approvedPosts: countsMap[college.slug]?.approved || 0,
    }))

    // Also compute totals
    let totalPending = 0
    let totalApproved = 0
    for (const c of collegesWithCounts) {
      totalPending += c.pendingPosts
      totalApproved += c.approvedPosts
    }

    return Response.json({
      success: true,
      data: {
        colleges: collegesWithCounts,
        totals: {
          colleges: colleges.length,
          posts: totalPending + totalApproved,
          pending: totalPending,
          approved: totalApproved,
        },
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
    const { name, city, state, type } = body

    if (!name || !city || !state || !type) {
      return Response.json(
        { success: false, error: 'name, city, state, and type are required' },
        { status: 400 }
      )
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check for duplicate slug
    const existing = await College.findOne({ slug })
    if (existing) {
      return Response.json(
        { success: false, error: 'A college with this name already exists' },
        { status: 409 }
      )
    }

    const college = await College.create({
      name,
      slug,
      city,
      state,
      type,
    })

    return Response.json({ success: true, data: college }, { status: 201 })
  } catch (error: any) {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
