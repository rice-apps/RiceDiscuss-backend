import Models from '../../model';
import { Model } from 'mongoose';

const CommentResolver = {
    Comment: {
        _id: async ({ _id }) => {
            return Models.Comment.findById(_id).select("_id");
        },
        creator: async ({ _id }) => {
            return Models.Comment.findById(_id).select("creator");
        },
        post_id: async ({ _id }) => {
            return Models.Comment.findById(_id).select("post_id");
        },
        date_created: async ({ _id }) => {
            return Models.Comment.findById(_id).select("date_created");
        },
        body: async ({ _id }) => {
            return Models.Comment.findById(_id).select("body");
        },
        upvotes: async ({ _id }) => {
            return Models.Comment.findById(_id).select("upvotes");
        },
        downvotes: async ({ _id }) => {
            return Models.Comment.findById(_id).select("downvotes");
        },
        children: async ({ _id }) => {
            return Models.Comment.findById(_id).select("children");
        },
        depth: async ({ _id }) => {
            return Models.Comment.findById(_id).select("depth");
        }
    }
}

export default CommentResolver;
