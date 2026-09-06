import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected:[${conn.connection.name}] database`);
  } catch (error) {
    console.error(`Error on db connection : ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
