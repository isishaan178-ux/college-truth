import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import Post from '@/lib/models/Post'
import Submission from '@/lib/models/Submission'

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === process.env.ADMIN_SECRET
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

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
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
