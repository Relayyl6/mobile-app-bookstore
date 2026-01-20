import mongoose from "mongoose";
import { DB_URL } from "../config/env.js";

export const connectToDatabse = async () => {

    try {
        // console.log(DB_URL)
        const conn = await mongoose.connect(DB_URL);
        console.log(`Database connected ${conn.connection.host}`)
    } catch(error) {
        console.error("An error occured when connectign to the database: ", error);
        process.exit(1);
    }
}