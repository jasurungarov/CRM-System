import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Next.js dev rejimida hot-reload paytida qayta-qayta ulanib ketmasligi uchun
// global obyektga keshlaymiz.
declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI .env faylida belgilanmagan");
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
