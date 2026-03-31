import mongoose, { Schema, Document, Model } from 'mongoose'
import type { PostCategory } from './Post'

export interface ISubmission extends Document {
  collegeName: string
  collegeSlug: string
  category: PostCategory
  content: string
  author: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  adminNote: string
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
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
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    email: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
)

const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)

export default Submission
