import mongoose from 'mongoose';
import { MONGODB_CONNECTION_URL } from './config';

const url = MONGODB_CONNECTION_URL;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to MongoDB server!");
});
