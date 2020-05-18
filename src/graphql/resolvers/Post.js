import Models from '../../model';

async function preparePost(id, param) {
    var res = await Models.Post.findById(id).select(param);
    return res[param];
}

const PostResolver = {
    Post: {
        id: async ({ id }) => await preparePost(id, "_id"),
        creator: async ({ id }) => await preparePost(id, "creator"),
        title: async ({ id }) => await preparePost(id, "title"),
        body: async ({ id }) => await preparePost(id, "body"),
        date_created: async ({ id }) => await preparePost(id, "date_created"),
        upvotes: async ({ id }) => await preparePost(id, "upvotes"),
        downvotes: async ({ id }) => await preparePost(id, "downvotes"),
        tags: async ({ id }) => await preparePost(id, "tags"),
        postType: async ({ id }) => await preparePost(id, "postType"),
        start: async ({ id }) => await preparePost(id, "start"),
        end: async ({ id }) => await preparePost(id, "end"),
        place: async ({ id }) => await preparePost(id, "place"),
    },
};

export default PostResolver;
