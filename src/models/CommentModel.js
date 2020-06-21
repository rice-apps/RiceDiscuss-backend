import mongoose from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";

import composeDataloader from "../utils/dataloader";

const resolverList = [
    "findById",
    "findByIds",
    "findManyByParentID",
    "findManyByPostID",
    "findOne",
    "findMany",
    "count",
    "pagination",
    "createOne",
    "createMany",
    "updateById",
    "updateOne",
    "updateMany",
    "removeById",
    "removeOne",
    "removeMany",
];

const CommentSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true,
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
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
});

const Comment = mongoose.model("Comment", CommentSchema);
const CommentTC = composeWithMongoose(Comment, {
    paginationResolverName: "pagination", // Default
    findResolverName: "findMany",
    countResolverName: "count",
    perPage: 20, // Default
});

CommentTC.addResolver({
    name: "findManyByParentID",

    args: {
        parent: `ID`,
    },

    type: [CommentTC],

    resolve: async ({ args }) => {
        return Comment.find({ parent: args.parent });
    },
});

CommentTC.addResolver({
    name: "findManyByPostID",

    args: {
        post: `ID`,
    },

    type: [CommentTC],

    resolve: async ({ args }) => {
        return Comment.find({ post: args.post });
    },
});

CommentTC.addResolver({
    name: "findManyByCreator",

    args: {
        creator: `String`,
    },

    type: [CommentTC],

    resolve: async ({ args }) => {
        return Comment.find({ creator: args.creator });
    },
});

const CommentTCDL = composeDataloader(CommentTC, resolverList, {
    cacheExpiration: 3000,
    removeProjection: true,
    debug: false,
});

export { Comment, CommentTCDL as CommentTC };
