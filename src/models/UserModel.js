import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    netID: {
        type: String,
        required: true,
    },

    date_joined: {
        type: Date,
        required: true,
    },

    // We should store expiry date and net ID in the token.
    token: {
        type: String,
        required: false,
    },
});

export const User = mongoose.model('User', UserSchema);
export const UserTC = composeWithMongoose(User);
