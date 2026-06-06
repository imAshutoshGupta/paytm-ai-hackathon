import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache
}

global.mongooseCache = global.mongooseCache || { conn: null, promise: null }

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) throw new Error('MONGODB_URI not set')

  if (global.mongooseCache.conn) return global.mongooseCache.conn
  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: 'churnguard',
      serverSelectionTimeoutMS: 8000, // fail fast instead of hanging the function
    })
  }
  try {
    global.mongooseCache.conn = await global.mongooseCache.promise
  } catch (err) {
    // Reset the cached promise so a transient failure doesn't permanently
    // wedge a warm serverless instance into returning 500s.
    global.mongooseCache.promise = null
    throw err
  }
  return global.mongooseCache.conn
}

export function isMockMode(): boolean {
  return !process.env.MONGODB_URI
}
