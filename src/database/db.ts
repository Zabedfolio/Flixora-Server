import mongoose from 'mongoose';
import Config from '../config/config';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = Config.MONGODB_URI;

    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected Successfully! ✅');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;
