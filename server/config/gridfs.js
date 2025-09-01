// config/gridfs.js
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

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

const getFileBucket = async () => {
  const conn = await ensureConnection();
  
  return new Promise((resolve, reject) => {
    if (conn.readyState === 1) {
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads",
      });
      return resolve(bucket);
    }

    conn.once("open", () => {
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads",
      });
      resolve(bucket);
    });

    conn.once("error", (err) => {
      reject(err);
    });
  });
};

export { getFileBucket };
