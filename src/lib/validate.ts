import { z } from 'zod'

// Sanitize string — strip HTML tags to prevent XSS
export function sanitizeHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

// Strip MongoDB operators from user input to prevent NoSQL injection
export function stripMongoOps(str: string): string {
  return str.replace(/[${}]/g, '').trim()
}

// Validate MongoDB ObjectId format
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format')

// Validate slug — alphanumeric + hyphens only
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format').max(100)

// Search query — limit length, strip dangerous chars
export const searchQuerySchema = z.string().max(200).transform(stripMongoOps)

// Submission schema (public POST)
export const submissionSchema = z.object({
  collegeName: z.string().min(1).max(200).transform(sanitizeHtml),
  collegeSlug: z.string().max(100).optional(),
  category: z.enum([
    'PLACEMENTS', 'HOSTEL_MESS', 'PROFESSORS', 'MENTAL_HEALTH',
    'CAMPUS_LIFE', 'SPORTS', 'RESTRICTIONS', 'INFRASTRUCTURE', 'NEWS_CONTROVERSY',
  ]),
  content: z.string().min(10).max(5000).transform(sanitizeHtml),
  author: z.string().max(200).transform(sanitizeHtml).optional(),
  email: z.string().email().optional().or(z.literal('')),
})

// Scrape ingest schema (admin POST)
export const ingestSchema = z.object({
  posts: z.array(z.object({
    collegeName: z.string().min(1).max(200),
    category: z.string().min(1),
    content: z.string().min(1).max(10000),
    source: z.string().min(1),
    sourceUrl: z.string().optional().or(z.literal('')),
    sentiment: z.string().optional(),
    title: z.string().max(500).optional(),
    author: z.string().max(200).optional(),
  })).min(1),
})

// Escape regex special characters for safe use in RegExp
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
