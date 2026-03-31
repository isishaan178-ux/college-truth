import { connectDB } from '@/lib/mongodb'
import College from '@/lib/models/College'
import Post from '@/lib/models/Post'

interface IngestPost {
  collegeName: string
  category: string
  content: string
  source: string
  sourceUrl?: string
  sentiment: string
  title?: string
  author?: string
}

// Map post categories to college category fields
const categoryToField: Record<string, string> = {
  PLACEMENTS: 'placements',
  HOSTEL_MESS: 'hostel',
  PROFESSORS: 'professors',
  MENTAL_HEALTH: 'mentalHealth',
  CAMPUS_LIFE: 'campusLife',
  SPORTS: 'sports',
  RESTRICTIONS: 'restrictions',
  INFRASTRUCTURE: 'infrastructure',
}

// Convert sentiment to a numeric score
function sentimentToScore(sentiment: string): number {
  switch (sentiment) {
    case 'POSITIVE':
      return 8
    case 'NEGATIVE':
      return 3
    case 'NEUTRAL':
    default:
      return 5
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const { posts }: { posts: IngestPost[] } = body

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return Response.json(
        { success: false, error: 'posts array is required' },
        { status: 400 }
      )
    }

    const results = {
      created: 0,
      collegesCreated: 0,
      errors: [] as string[],
    }

    for (const item of posts) {
      try {
        const slug = item.collegeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        // Find or create college
        let college = await College.findOne({ slug })
        if (!college) {
          college = await College.create({
            name: item.collegeName,
            slug,
            city: 'Unknown',
            state: 'Unknown',
            type: 'private',
          })
          results.collegesCreated++
        }

        // Create post
        await Post.create({
          collegeId: college._id,
          collegeName: college.name,
          collegeSlug: slug,
          category: item.category,
          sentiment: item.sentiment || 'NEUTRAL',
          source: item.source || 'reddit',
          sourceUrl: item.sourceUrl || '',
          content: item.content,
          title: item.title || '',
          author: item.author || 'Anonymous',
          verified: true,
          isApproved: true,
        })

        results.created++

        // Update college scores
        const categoryField = categoryToField[item.category]
        if (categoryField) {
          const score = sentimentToScore(item.sentiment)
          const catPath = `categories.${categoryField}`
          const currentCat = (college.categories as any)?.[categoryField] || {
            score: 0,
            count: 0,
          }
          const newCount = currentCat.count + 1
          const newScore =
            (currentCat.score * currentCat.count + score) / newCount

          await College.findByIdAndUpdate(college._id, {
            $set: {
              [`${catPath}.score`]: Math.round(newScore * 10) / 10,
              [`${catPath}.count`]: newCount,
            },
            $inc: { totalPosts: 1 },
          })
        } else {
          await College.findByIdAndUpdate(college._id, {
            $inc: { totalPosts: 1 },
          })
        }

        // Recalculate overall score
        const updatedCollege = await College.findById(college._id)
        if (updatedCollege) {
          const cats = updatedCollege.categories
          const scores = [
            cats.placements.score,
            cats.hostel.score,
            cats.mess.score,
            cats.professors.score,
            cats.mentalHealth.score,
            cats.campusLife.score,
            cats.sports.score,
            cats.restrictions.score,
            cats.infrastructure.score,
          ].filter((s) => s > 0)

          if (scores.length > 0) {
            const overall =
              scores.reduce((a, b) => a + b, 0) / scores.length
            await College.findByIdAndUpdate(college._id, {
              overallScore: Math.round(overall * 10) / 10,
            })
          }
        }
      } catch (err: any) {
        results.errors.push(`${item.collegeName}: ${err.message}`)
      }
    }

    return Response.json({ success: true, data: results }, { status: 201 })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
