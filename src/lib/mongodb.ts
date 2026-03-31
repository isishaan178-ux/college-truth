import mongoose from 'mongoose'

let cached = (global as any).mongoose || { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri)
  }
  cached.conn = await cached.promise
  ;(global as any).mongoose = cached
  return cached.conn
}
