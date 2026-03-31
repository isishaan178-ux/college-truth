import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const state = searchParams.get('state') || ''
    const sort = searchParams.get('sort') || 'overallScore'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const filter: Record<string, any> = {}

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }
    if (type) {
      filter.type = type
    }
    if (state) {
      filter.state = { $regex: state, $options: 'i' }
    }

    const sortOptions: Record<string, any> = {}
    switch (sort) {
      case 'name':
        sortOptions.name = 1
        break
      case 'totalPosts':
        sortOptions.totalPosts = -1
        break
      case 'overallScore':
      default:
        sortOptions.overallScore = -1
        break
    }

    const skip = (page - 1) * limit
    const [colleges, total] = await Promise.all([
      College.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      College.countDocuments(filter),
    ])

    return Response.json({
      success: true,
      data: colleges,
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
