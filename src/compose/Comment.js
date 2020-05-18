import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { schemaComposer } from 'graphql-compose';

const CommentSchema = mongoose.Schema({
        creator: {
            type: String,
            required: true,
        },
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        parent_id: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        date_created: {
            type: Date,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        upvotes: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                
            }], 
            required: true,
            default: []
        },

        downvotes: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                
            }], 
            required: true,
            default: []
        },

        children: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }],
            required: true,
            default: []
        },

        depth: {
            type: Number,
            required: true,
            default: 0
        },
});

const Comment = mongoose.model('Comment', CommentSchema);
const CommentTC = composeWithMongoose(Comment, {});

//define queries
schemaComposer.Query.addResolver({
    commentById: CommentTC.getResolver('findById'),
    commentByIds: CommentTC.getResolver('findByIds'),
    commentOne: CommentTC.getResolver('findOne'),
    commentMany: CommentTC.getResolver('findMany'),
    commentCount: CommentTC.getResolver('count')
});

//define mutations
schemaComposer.Mutation.addFields({
    commentCreateOne: CommentTC.getResolver('createOne'),
    commentCreateMany: CommentTC.getResolver('createMany'),
    commentUpdateById: CommentTC.getResolver('updateById'),
    commentUpdateOne: CommentTC.getResolver('updateOne'),
    commentUpdateMany: CommentTC.getResolver('updateMany'),
    commentRemoveById: CommentTC.getResolver('removeById'),
    commentRemoveOne: CommentTC.getResolver('removeOne'),
    commentRemoveMany: CommentTC.getResolver('removeMany')
});


const CommentGQLSchema = schemaComposer.buildSchema();

export default CommentGQLSchema;