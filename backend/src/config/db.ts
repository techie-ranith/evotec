import mongoose from 'mongoose';

type GlobalMongoose = typeof globalThis & {
  _mongooseConnect?: Promise<typeof mongoose>;
};

const g = globalThis as GlobalMongoose;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!g._mongooseConnect) {
    g._mongooseConnect = mongoose.connect(uri);
  }

  try {
    await g._mongooseConnect;
    console.log('MongoDB connected');
  } catch (error) {
    g._mongooseConnect = undefined;
    console.error('\nMongoDB connection failed.');
    console.error(
      'In Atlas → Network Access, allow access from anywhere (0.0.0.0/0) for Vercel, or your current IP for local/dev.'
    );
    console.error('Then wait ~1 minute and retry.\n');
    throw error;
  }
}
