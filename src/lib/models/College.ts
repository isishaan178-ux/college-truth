import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategoryScore {
  score: number
  count: number
}

export interface ICategories {
  placements: ICategoryScore
  hostel: ICategoryScore
  mess: ICategoryScore
  professors: ICategoryScore
  mentalHealth: ICategoryScore
  campusLife: ICategoryScore
  sports: ICategoryScore
  restrictions: ICategoryScore
  infrastructure: ICategoryScore
}

export interface ICollege extends Document {
  name: string
  slug: string
  city: string
  state: string
  type: 'private' | 'government' | 'deemed' | 'autonomous'
  established: number
  description: string
  imageUrl: string
  categories: ICategories
  overallScore: number
  totalPosts: number
  createdAt: Date
  updatedAt: Date
}

const CategoryScoreSchema = new Schema<ICategoryScore>(
  {
    score: { type: Number, default: 0, min: 0, max: 10 },
    count: { type: Number, default: 0 },
  },
  { _id: false }
)

const CollegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    type: {
      type: String,
      enum: ['private', 'government', 'deemed', 'autonomous'],
      required: true,
    },
    established: { type: Number },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    categories: {
      placements: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      hostel: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      mess: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      professors: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      mentalHealth: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      campusLife: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      sports: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      restrictions: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
      infrastructure: { type: CategoryScoreSchema, default: () => ({ score: 0, count: 0 }) },
    },
    overallScore: { type: Number, default: 0, min: 0, max: 10 },
    totalPosts: { type: Number, default: 0 },
  },
  { timestamps: true }
)

CollegeSchema.index({ name: 'text' })

const College: Model<ICollege> =
  mongoose.models.College || mongoose.model<ICollege>('College', CollegeSchema)

export default College
