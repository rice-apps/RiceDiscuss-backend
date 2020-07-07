import { composeWithMongoose } from "graphql-compose-mongoose";
import log from "loglevel";
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true,
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostInterface",
        required: true,
    },

    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: false,
    },

    date_created: {
        type: Date,
        required: false,
        default: new Date().getTime(),
        index: true,
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
        },
    ],

    downvotes: [
        {
            type: String,
        },
    ],

    reports: {
        type: Number,
        default: 0,
    },
});

const Comment = mongoose.model("Comment", CommentSchema);

const CommentTC = composeWithMongoose(Comment);

CommentTC.addResolver({
    name: "findManyByParentID",

    args: {
        parent: "ID",
    },

    type: [CommentTC],

    resolve: async ({ args }) => {
        return Comment.find({ parent: args.parent }).catch((err) =>
            log.error(err),
        );
    },
})
    .addResolver({
        name: "findManyByPostID",

        args: {
            post: "ID",
        },

        type: [CommentTC],

        resolve: async ({ args }) => {
            return Comment.find({ post: args.post }).catch((err) =>
                log.err(err),
            );
        },
    })
    .addResolver({
        name: "findManyByCreator",

        args: {
            creator: "String",
        },

        type: [CommentTC],

        resolve: async ({ args }) => {
            return Comment.find({ creator: args.creator }).catch((err) =>
                log.err(err),
            );
        },
    });

export { Comment, CommentTC };
