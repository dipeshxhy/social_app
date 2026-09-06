import mongoose from 'mongoose';
let cachedConnection = null;

const connectDB = async () => {
  try {
    if (cachedConnection) {
      console.log(`MongoDB Connected:[${cachedConnection.connection.name}] database`);
      return cachedConnection;
    }
    cachedConnection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected:[${cachedConnection.connection.name}] database`);
    return cachedConnection;
  } catch (error) {
    console.error(`Error on db connection : ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
