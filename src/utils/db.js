import mongoose from "mongoose";
import { MONGODB_CONNECTION_URL, MONGOOSE_CONFIG } from "../config";

try {
    mongoose.connect(MONGODB_CONNECTION_URL, MONGOOSE_CONFIG);
} catch (err) {
    console.log(err);
} finally {
    mongoose.connection.on("connected", () => {
        console.log("Mongoose connected to MongoDB server!");
    });
}
