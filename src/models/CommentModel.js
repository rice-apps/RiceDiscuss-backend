import { ApolloError } from "apollo-server-express";
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

    reports: [
        {
            type: String,
        },
    ],
});

const Comment = mongoose.model("Comment", CommentSchema);

const CommentTC = composeWithMongoose(Comment);

CommentTC.addResolver({
    name: "findManyByParentID",

    args: {
        parent: "ID",
    },

    type: [CommentTC],

    resolve: ({ args }) =>
        Comment.find({ parent: args.parent })
            .then((res) => res)
            .catch((err) => {
                log.error(err);
                return new ApolloError(
                    `Comment findManyByParentID failed: ${err}`,
                );
            }),
})
    .addResolver({
        name: "findManyByPostID",

        args: {
            post: "ID",
        },

        type: [CommentTC],

        resolve: ({ args }) =>
            Comment.find({ post: args.post })
                .then((res) => res)
                .catch((err) => {
                    log.error(err);
                    return new ApolloError(
                        `Comment findManyByPostID failed: ${err}`,
                    );
                }),
    })
    .addResolver({
        name: "findManyByCreator",

        args: {
            creator: "String",
        },

        type: [CommentTC],

        resolve: ({ args }) =>
            Comment.find({ creator: args.creator })
                .then((res) => res)
                .catch((err) => {
                    log.error(err);
                    return new ApolloError(
                        `Comment findManyByCreator failed: ${err}`,
                    );
                }),
    })
    .addResolver({
        name: "findTopLevelByPostID",

        args: {
            postID: `ID`,
        },

        type: [CommentTC],

        resolve: ({ args }) =>
            Comment.find({ post: args.postID, parent: { $exists: false } })
                .then((res) => res)
                .catch((err) => {
                    log.error(err);
                    return new ApolloError(
                        `Comment findTopLevelByPostID failed: ${err}`,
                    );
                }),
    });

export { Comment, CommentTC };
