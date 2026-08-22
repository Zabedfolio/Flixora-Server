import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_DB_URI;

    if (!mongoURI) {
      throw new Error('MONGO_DB_URI is not defined in .env');
    }

    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected Successfully! ✅');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;
