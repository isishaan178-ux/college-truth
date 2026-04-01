import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { recalculateScores } from '@/lib/recalculate-scores'

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    await connectDB()

    const body = await request.json()
    const { collegeSlug } = body

    if (!collegeSlug) {
      return Response.json(
        { success: false, error: 'collegeSlug is required' },
        { status: 400 }
      )
    }

    const result = await Post.updateMany(
      { collegeSlug, isApproved: false },
      { $set: { isApproved: true, verified: true } }
    )

    await recalculateScores(collegeSlug)

    return Response.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
