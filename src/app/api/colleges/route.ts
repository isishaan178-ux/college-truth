import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import { escapeRegex, stripMongoOps } from '@/lib/validate'

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = stripMongoOps(searchParams.get('search') || '').slice(0, 200)
    const type = searchParams.get('type') || ''
    const state = stripMongoOps(searchParams.get('state') || '').slice(0, 100)
    const sort = searchParams.get('sort') || 'overallScore'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)

    const filter: Record<string, any> = {}

    if (search) {
      filter.name = { $regex: escapeRegex(search), $options: 'i' }
    }
    if (type && typeof type === 'string') {
      filter.type = type
    }
    if (state) {
      filter.state = { $regex: escapeRegex(state), $options: 'i' }
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
    console.error('Colleges GET error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
