import mongoose from "mongoose";
// import { MongoClient, ServerApiVersion } from "mongodb"
import { DB_URL } from "../config/env.js";

export const connectToDatabse = async () => {

    try {
        console.log("Attempting to connect to MongoDB...");
        
        const conn = await mongoose.connect(DB_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log(`Database connected: ${conn.connection.host}`);
    } catch(error) {
        console.error("An error occured when connectign to the database: ", error);
        process.exit(1);
    }
}