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
            type: String,
        }
    ],

    downvotes: [
        {
            type: String,
        }
    ],
});


const Comment = mongoose.model("Comment", CommentSchema);
const CommentTC = composeWithMongoose(Comment);

CommentTC.addResolver({
    name: 'findManyByParentID',

    args: {
        parent_id: 'ID',
    },

    type: [CommentTC],

    resolve: async ({ source, args, context, info }) => {
        return await Comment.find({ parent_id: args.parent_id });
    },

});

CommentTC.addResolver({
    name: 'findManyByPostID',

    args: {
        post_id: 'ID',
    },

    type: [CommentTC],

    resolve: async ({ source, args, context, info }) => {
        return await Comment.find({ post_id: args.post_id });
    },
});

export {
    Comment,
    CommentTC,
}
