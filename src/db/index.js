import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("connected to db successfully !!", connectionInstance.connection.host);
    } catch (error) {
        console.log("connection error", error);
        // Read about this in the documentation of nodejs process object
        process.exit(1);
    }
}

export default connectDB;