import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import Post from '@/lib/models/Post'

const SENTIMENT_SCORES: Record<string, number> = {
  POSITIVE: 8,
  NEUTRAL: 5,
  NEGATIVE: 3,
}

const CATEGORY_TO_FIELDS: Record<string, string[]> = {
  PLACEMENTS: ['placements'],
  HOSTEL_MESS: ['hostel', 'mess'],
  PROFESSORS: ['professors'],
  MENTAL_HEALTH: ['mentalHealth'],
  CAMPUS_LIFE: ['campusLife'],
  SPORTS: ['sports'],
  RESTRICTIONS: ['restrictions'],
  INFRASTRUCTURE: ['infrastructure'],
  NEWS_CONTROVERSY: ['campusLife'],
}

export async function recalculateScores(collegeSlug: string) {
  await connectDB()

  const approvedPosts = await Post.find({
    collegeSlug,
    isApproved: true,
  }).lean()

  // Build category aggregations
  const categoryAgg: Record<string, { total: number; count: number }> = {}

  for (const post of approvedPosts) {
    const fields = CATEGORY_TO_FIELDS[post.category]
    if (!fields) continue

    const sentimentScore = SENTIMENT_SCORES[post.sentiment] || 5
    for (const field of fields) {
      if (!categoryAgg[field]) {
        categoryAgg[field] = { total: 0, count: 0 }
      }
      categoryAgg[field].total += sentimentScore
      categoryAgg[field].count += 1
    }
  }

  // Build the categories update object
  const categoriesUpdate: Record<string, { score: number; count: number }> = {}
  const allFields = [
    'placements', 'hostel', 'mess', 'professors', 'mentalHealth',
    'campusLife', 'sports', 'restrictions', 'infrastructure',
  ]

  let totalScore = 0
  let totalCategories = 0

  for (const field of allFields) {
    const agg = categoryAgg[field]
    if (agg && agg.count > 0) {
      const score = Math.round((agg.total / agg.count) * 10) / 10
      categoriesUpdate[field] = { score, count: agg.count }
      totalScore += score
      totalCategories += 1
    } else {
      categoriesUpdate[field] = { score: 0, count: 0 }
    }
  }

  const overallScore = totalCategories > 0
    ? Math.round((totalScore / totalCategories) * 10) / 10
    : 0

  await College.findOneAndUpdate(
    { slug: collegeSlug },
    {
      categories: categoriesUpdate,
      overallScore,
      totalPosts: approvedPosts.length,
    }
  )
}
