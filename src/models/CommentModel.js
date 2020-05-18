import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

const CommentSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true,
    },

    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },

    parent_id: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },

    date_created: {
        type: Date,
        required: true,
    },

    body: {
        type: String,
        required: true,
    },

    upvotes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",

        }],
        required: true,
        default: [],
    },

    downvotes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",

        }],
        required: true,
        default: [],
    },

    children: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        required: true,
        default: [],
    },

    depth: {
        type: Number,
        required: true,
        default: 0,
    },
});

export const Comment = mongoose.model("Comment", CommentSchema);
export const CommentTC = composeWithMongoose(Comment);
