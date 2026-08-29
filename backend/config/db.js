const mongoose = require("mongoose");

const DEFAULT_MONGODB_URI =
  "mongodb+srv://kathirashok255:Akkathir2005@cluster0.ly7x9.mongodb.net/agri-billing?appName=Cluster0";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is undefined and no fallback URI is provided.");
    }
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
