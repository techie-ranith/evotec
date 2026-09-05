import mongoose from 'mongoose';

type GlobalMongoose = typeof globalThis & {
  _mongooseConnect?: Promise<typeof mongoose>;
};

const g = globalThis as GlobalMongoose;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set on the server');
  }

  // 1 = connected only (do not treat "connecting" as ready)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!g._mongooseConnect) {
    g._mongooseConnect = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      maxPoolSize: 5,
    });
  }

  try {
    await g._mongooseConnect;
    if (mongoose.connection.readyState !== 1) {
      throw new Error(
        `MongoDB not ready (readyState=${mongoose.connection.readyState})`
      );
    }
    console.log('MongoDB connected');
  } catch (error) {
    g._mongooseConnect = undefined;
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    console.error('\nMongoDB connection failed.');
    console.error(
      'Atlas → Network Access: allow 0.0.0.0/0 for Vercel (dynamic IPs).'
    );
    console.error('Confirm MONGODB_URI is set in the Vercel backend project.\n');
    throw error;
  }
}

export function dbReadyState(): number {
  return mongoose.connection.readyState;
}
