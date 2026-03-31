import { connectDB } from '@/lib/mongodb'
import Submission from '@/lib/models/Submission'

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const filter: Record<string, any> = {}
    if (status) filter.status = status

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
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const { collegeName, collegeSlug, category, content, author, email } = body

    if (!content || !collegeName || !category) {
      return Response.json(
        { success: false, error: 'collegeName, category, and content are required' },
        { status: 400 }
      )
    }

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

    return Response.json({ success: true, data: submission }, { status: 201 })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
