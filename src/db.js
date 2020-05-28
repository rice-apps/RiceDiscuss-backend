import mongoose from "mongoose";
import { MONGODB_CONNECTION_URL } from "./config";

mongoose.connect(MONGODB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to MongoDB server!");
});
