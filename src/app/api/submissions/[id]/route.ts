import { connectDB } from '@/lib/mongodb'
import Submission from '@/lib/models/Submission'
import Post from '@/lib/models/Post'
import College from '@/lib/models/College'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const body = await request.json()
    const { status, adminNote } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return Response.json(
        { success: false, error: 'status must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    const submission = await Submission.findById(id)
    if (!submission) {
      return Response.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    submission.status = status
    if (adminNote) submission.adminNote = adminNote
    await submission.save()

    // If approved, create a Post from the submission
    if (status === 'approved') {
      let college = await College.findOne({ slug: submission.collegeSlug })

      if (!college) {
        // Auto-create college if it doesn't exist
        college = await College.create({
          name: submission.collegeName,
          slug: submission.collegeSlug,
          city: 'Unknown',
          state: 'Unknown',
          type: 'private',
        })
      }

      await Post.create({
        collegeId: college._id,
        collegeName: college.name,
        collegeSlug: college.slug,
        category: submission.category,
        sentiment: 'NEUTRAL',
        source: 'user_submission',
        content: submission.content,
        author: submission.author,
        verified: false,
        isApproved: true,
      })

      await College.findByIdAndUpdate(college._id, {
        $inc: { totalPosts: 1 },
      })
    }

    return Response.json({ success: true, data: submission })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
