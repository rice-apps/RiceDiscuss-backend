import Models from '../../model';

const CommentResolver = {
    Comment: {
        _id: async ({ id }) => {
            return Models.Comment.findById(id).select("id");
        },
        creator: async ({ id }) => {
            return Models.Comment.findById(id).select("creator");
        },
        postid: async ({ id }) => {
            return Models.Comment.findById(id).select("postid");
        },
        date_created: async ({ id }) => {
            return Models.Comment.findById(id).select("date_created");
        },
        body: async ({ id }) => {
            return Models.Comment.findById(id).select("body");
        },
        upvotes: async ({ id }) => {
            return Models.Comment.findById(id).select("upvotes");
        },
        downvotes: async ({ id }) => {
            return Models.Comment.findById(id).select("downvotes");
        },
        children: async ({ id }) => {
            return Models.Comment.findById(id).select("children");
        },
        depth: async ({ id }) => {
            return Models.Comment.findById(id).select("depth");
        }
    }
}

export default CommentResolver;
