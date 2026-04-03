import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import Post from '@/lib/models/Post'
import Submission from '@/lib/models/Submission'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    await connectDB()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
      totalColleges,
      totalPosts,
      pendingSubmissions,
      postsToday,
      postsBySourceRaw,
      postsByCategoryRaw,
    ] = await Promise.all([
      College.countDocuments(),
      Post.countDocuments(),
      Submission.countDocuments({ status: 'pending' }),
      Post.countDocuments({ createdAt: { $gte: todayStart } }),
      Post.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Post.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ])

    const postsBySource: Record<string, number> = {}
    for (const item of postsBySourceRaw) {
      postsBySource[item._id] = item.count
    }

    const postsByCategory: Record<string, number> = {}
    for (const item of postsByCategoryRaw) {
      postsByCategory[item._id] = item.count
    }

    return Response.json({
      success: true,
      data: {
        totalColleges,
        totalPosts,
        pendingSubmissions,
        postsToday,
        postsBySource,
        postsByCategory,
      },
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
