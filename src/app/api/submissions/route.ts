import { connectDB } from '@/lib/mongodb'
import Submission from '@/lib/models/Submission'
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { submissionSchema } from '@/lib/validate'

// GET requires admin auth — submissions may contain emails
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)

    const filter: Record<string, any> = {}
    if (status && typeof status === 'string') filter.status = status

    const skip = (page - 1) * limit
    const [submissions, total] = await Promise.all([
      Submission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Submission.countDocuments(filter),
    ])

    return Response.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Submissions GET error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST is public — anyone can submit, but it goes to pending
export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const result = submissionSchema.safeParse(body)
    if (!result.success) {
      return Response.json(
        { success: false, error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const { collegeName, collegeSlug, category, content, author, email } = result.data
    const slug = collegeSlug || collegeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const submission = await Submission.create({
      collegeName,
      collegeSlug: slug,
      category,
      content,
      author: author || 'Anonymous',
      email: email || '',
      status: 'pending',
    })

    return Response.json({ success: true, data: { id: submission._id } }, { status: 201 })
  } catch (error: any) {
    console.error('Submissions POST error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
