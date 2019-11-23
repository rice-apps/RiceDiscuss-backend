import Models from '../../model';

const MutationResolver = {
    Mutation: {
        updatePost: async (_id, body, title) => {
            const post = await Models.Post.findOne({_id: _id});
            if (body && body !== "") post.body = body;
            if (title && title !== "") post.title = title;
            await post.save();
        },
        createPost: async (body, title) => {

        },
        deletePost: async (_id) => {
            return Models.Post.findByID(_id);
        },
        upvotePost:  async (_id) => {
            const post = await Models.Post.findOne({_id: _id});

            return Models.Post.findByID(_id);
        },
        downvotePost:  async (_id) => {
            return Models.Post.findByID(_id);
        },

        createComment:  async (body, post_id, parent_id) => {
            return Models.Post.findByID(_id);
        },
        updateComment: async (_id, body) => {
            const comment = await Models.Comment.findOne({_id: _id});
            if (body && body !== "") comment.body = body;
            await comment.save();
        },
        deleteComment: async (_id) => {

        },
    }
}

export default MutationResolver;
