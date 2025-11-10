import mongoose from 'mongoose';

export const connectDB = async () => {
  const URL= process.env.MONGODB_URI;
  try {
    await mongoose.connect(URL);
    console.log('MongoDB connected');
    const conn = mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};


