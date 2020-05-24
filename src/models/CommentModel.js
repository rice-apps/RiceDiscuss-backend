import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

import composeDataloader from '../utils/dataloader';

const resolverList = ['findById', 'findByIds', 'findManyByParentID', 'findManyByPostID',
    'findOne', 'findMany', 'count', 'createOne', 'createMany', 'updateById', 'updateOne',
    'updateMany', 'removeById', 'removeOne', 'removeMany'];

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
        required: false,
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
        parent_id: `ID`,
    },

    type: [CommentTC],

    resolve: async ({ args }) => {
        return await Comment.find({ parent_id: args.parent_id });
    },

});

CommentTC.addResolver({
    name: 'findManyByPostID',

    args: {
        post_id: `ID`,
    },

    type: [CommentTC],

    resolve: async ({ args }) => {
        return await Comment.find({ post_id: args.post_id });
    },
});

CommentTC.addResolver({
    name: 'findManyByCreator',

    args: {
        creator: `String`,
    },

    type: [CommentTC],

    resolve: async ({ args }) => {
        return await Comment.find({ creator: args.creator });
    },
});

const CommentTCDL = composeDataloader(CommentTC, resolverList, {
    cacheExpiration: 3000,
    removeProjection: true,
    debug: false,
});

export {
    Comment,
    CommentTCDL as CommentTC,
}
