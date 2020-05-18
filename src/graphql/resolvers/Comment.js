import Models from '../../model';

async function prepareComment(id, param) {
    var res = await Models.Comment.findById(id).select(param);
    return res[param];
}

const CommentResolver = {
    Comment: {
        id: async ({ id }) => await prepareComment(id, "_id"),
        creator: async ({ id }) => await prepareComment(id, "creator"),
        post_id: async ({ id }) => await prepareComment(id, "post_id"),
        date_created: async ({ id }) => await prepareComment(id, "date_created"),
        body: async ({ id }) => await prepareComment(id, "body"),
        upvotes: async ({ id }) => await prepareComment(id, "upvotes"),
        downvotes: async ({ id }) => await prepareComment(id, "downvotes"),
        children: async ({ id }) => await prepareComment(id, "children"),
        depth: async ({ id }) => await prepareComment(id, "depth"),
    },
};

export default CommentResolver;
