// config/imageBucket.js
import mongoose from "mongoose";

let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) throw new Error("Missing MONGO_URI in environment");
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }
    isConnected = true;
  }
  return mongoose.connection;
};

const getFileBucketMenuImage = async () => {
  const conn = await ensureConnection();
  
  return new Promise((resolve, reject) => {
    if (conn.readyState === 1) {
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "menuimages",
      });
      return resolve(bucket);
    }

    conn.once("open", () => {
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "menuimages",
      });
      resolve(bucket);
    });

    conn.once("error", (err) => {
      reject(err);
    });
  });
};

export { getFileBucketMenuImage };
