import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IIncident extends Document {
  collegeSlug: string
  collegeName: string
  title: string
  content: string
  source: string         // 'news'
  sourceName: string     // 'NDTV', 'Times of India', etc.
  sourceUrl: string
  date: Date | null
  type: string           // 'suicide' | 'death'
  verified: boolean
  contentHash: string
  searchQuery: string
  scrapedAt: Date
  createdAt: Date
  updatedAt: Date
}

const IncidentSchema = new Schema<IIncident>(
  {
    collegeSlug: { type: String, required: true, index: true },
    collegeName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    source: { type: String, default: 'news' },
    sourceName: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    date: { type: Date, default: null },
    type: { type: String, default: 'death' },
    verified: { type: Boolean, default: false },
    contentHash: { type: String, unique: true, sparse: true },
    searchQuery: { type: String, default: '' },
    scrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, strict: false }
)

IncidentSchema.index({ collegeSlug: 1, type: 1 })

const Incident: Model<IIncident> =
  mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema)

export default Incident
