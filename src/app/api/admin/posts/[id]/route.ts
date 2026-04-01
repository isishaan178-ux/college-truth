import { connectDB } from '@/lib/mongodb'
import Post from '@/lib/models/Post'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { recalculateScores } from '@/lib/recalculate-scores'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    await connectDB()
    const { id } = await params

    const post = await Post.findById(id)
    if (!post) {
      return Response.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    const collegeSlug = post.collegeSlug
    await Post.findByIdAndDelete(id)

    await recalculateScores(collegeSlug)

    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
