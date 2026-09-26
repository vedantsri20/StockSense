const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // 1. Attempt connection to configured MONGO_URI
  if (uri && !uri.includes('username:password')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.warn(`[Database Warning] External MongoDB connection failed (${error.message}).`);
    }
  }

  // 2. Resilient fallback for zero-friction local and hackathon demos
  try {
    console.log(`[Database] Initializing In-Memory MongoDB engine for local demo...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const fallbackUri = mongoMemoryServerInstance.getUri();

    const conn = await mongoose.connect(fallbackUri);
    console.log(`[Database] In-Memory MongoDB Connected at: ${fallbackUri}`);
    console.log(`[Database] Note: For persistent cloud storage, set MONGO_URI in backend/.env`);
    return true;
  } catch (fallbackError) {
    console.error(`[Database Fatal] Could not initialize fallback MongoDB: ${fallbackError.message}`);
    return false;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
