import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoUri);

    console.log('MongoDB connected successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('MongoDB connection failed:', error.message);
    } else {
      console.error('MongoDB connection failed');
    }

    process.exit(1);
  }
};