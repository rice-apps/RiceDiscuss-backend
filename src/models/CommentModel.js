import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

const CommentSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.String,
        ref: "User",
        required: true,
    },

    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },

    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },

    date_created: {
        type: Date,
        required: false,
        default: (new Date()).getTime(),
    },

    body: {
        type: String,
        required: true,
    },

    depth: {
        type: Number,
        required: false,
        default: 0,
    },
});

export const Comment = mongoose.model("Comment", CommentSchema);
export const CommentTC = composeWithMongoose(Comment);
