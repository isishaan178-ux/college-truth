import mongoose, { Schema, Document, Model } from 'mongoose'

export type PostCategory =
  | 'PLACEMENTS'
  | 'HOSTEL_MESS'
  | 'PROFESSORS'
  | 'MENTAL_HEALTH'
  | 'CAMPUS_LIFE'
  | 'SPORTS'
  | 'RESTRICTIONS'
  | 'INFRASTRUCTURE'
  | 'NEWS_CONTROVERSY'

export type PostSentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

export type PostSource =
  | 'reddit'
  | 'quora'
  | 'shiksha'
  | 'collegedunia'
  | 'youtube'
  | 'news'
  | 'user_submission'

export interface IPost extends Document {
  collegeId: mongoose.Types.ObjectId
  collegeName: string
  collegeSlug: string
  category: PostCategory
  sentiment: PostSentiment
  source: PostSource
  sourceUrl: string
  content: string
  title: string
  upvotes: number
  author: string
  verified: boolean
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    collegeName: { type: String, required: true },
    collegeSlug: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: [
        'PLACEMENTS',
        'HOSTEL_MESS',
        'PROFESSORS',
        'MENTAL_HEALTH',
        'CAMPUS_LIFE',
        'SPORTS',
        'RESTRICTIONS',
        'INFRASTRUCTURE',
        'NEWS_CONTROVERSY',
      ],
      required: true,
    },
    sentiment: {
      type: String,
      enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
      required: true,
    },
    source: {
      type: String,
      enum: ['reddit', 'quora', 'shiksha', 'collegedunia', 'youtube', 'news', 'user_submission'],
      required: true,
    },
    sourceUrl: { type: String, default: '' },
    content: { type: String, required: true },
    title: { type: String, default: '' },
    upvotes: { type: Number, default: 0 },
    author: { type: String, default: 'Anonymous' },
    verified: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
)

PostSchema.index({ collegeSlug: 1, category: 1 })
PostSchema.index({ category: 1, sentiment: 1 })

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)

export default Post
