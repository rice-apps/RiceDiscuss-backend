import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

const CommentSchema = new mongoose.Schema({
    creator: {
        type: String,
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
        required: true,
        default: 0,
    },

    upvotes: [
        {
            users: [{
                type: String,
                ref: 'User',
            }]
        }
    ],

    downvotes: [
        {
            users: [{
                type: String,
                ref: 'User',
            }]
        }
    ]
});

export const Comment = mongoose.model("Comment", CommentSchema);
export const CommentTC = composeWithMongoose(Comment);
