import { CommentTC, PostDTC, UserTC, Post } from "../models";

import {
    checkLoggedIn,
    userCheckPost,
    userCheckCreate,
    checkHTML,
    pubsub,
} from "../utils";

PostDTC.addFields({
    comments: [CommentTC],
});

PostDTC.addRelation("comments", {
    resolver: () => CommentTC.getResolver("findManyByPostID"),

    prepareArgs: {
        post: (source) => source._id,
    },

    projection: {
        _id: 1,
    },
});

PostDTC.addRelation("creator", {
    resolver: () => UserTC.getResolver("findOne"),

    prepareArgs: {
        filter: (source) => {
            return {
                netID: source.creator,
            };
        },
    },

    projection: {
        creator: 1,
    },
});

PostDTC.addRelation("upvotes", {
    resolver: () => UserTC.getResolver("findMany"),

    prepareArgs: {
        filter: (source) => {
            return {
                _operators: {
                    netID: {
                        in: source.upvotes,
                    },
                },
            };
        },
    },

    projection: {
        upvotes: 1,
    },
});

PostDTC.addRelation("downvotes", {
    resolver: () => UserTC.getResolver("findMany"),

    prepareArgs: {
        filter: (source) => {
            return {
                _operators: {
                    netID: {
                        in: source.downvotes,
                    },
                },
            };
        },
    },

    projection: {
        downvotes: 1,
    },
});

PostDTC.addResolver({
    name: "upvotePost",
    type: PostDTC.getDInterface(),
    args: { _id: "ID!", netID: "String!" },
    resolve: async ({ args, context }) => {
        if (args.netID !== context.netID) {
            throw new Error("cannot upvote as someone else");
        }

        const post = await Post.findById(args._id)
            .then((res) => {
                return res;
            })
            .catch((err) => console.log(err));

        if (post == null) {
            throw new Error("trying to upvote nonexistent post");
        }

        if (post.upvotes.includes(args.netID)) {
            post.upvotes = post.upvotes.filter(
                (upvoter) => upvoter !== args.netID,
            );
        } else if (post.downvotes.includes(args.netID)) {
            post.downvotes = post.downvotes.filter(
                (downvoter) => downvoter !== args.netID,
            );
            post.upvotes.push(args.netID);
        } else {
            post.upvotes.push(args.netID);
        }

        await post.save().catch((err) => console.log(err));

        return post;
    },
});

PostDTC.addResolver({
    name: "downvotePost",
    type: PostDTC.getDInterface(),
    args: { _id: "ID!", netID: "String!" },
    resolve: async ({ args, context }) => {
        if (args.netID !== context.netID) {
            throw new Error("cannot downvote as someone else");
        }

        const post = await Post.findById(args._id)
            .then((res) => {
                return res;
            })
            .catch((err) => console.log(err));

        if (post == null) {
            throw new Error("trying to upvote nonexistent post");
        }

        if (post.downvotes.includes(args.netID)) {
            post.downvotes = post.downvotes.filter(
                (downvoter) => downvoter !== args.netID,
            );
        } else if (post.upvotes.includes(args.netID)) {
            post.upvotes = post.upvotes.filter(
                (upvoter) => upvoter !== args.netID,
            );
            post.downvotes.push(args.netID);
        } else {
            post.downvotes.push(args.netID);
        }

        await post.save();

        return post;
    },
});

const postCreatedSub = (next) => async (rp) => {
    const payload = await next(rp);

    await pubsub.publish("postCreated", {
        postCreated: payload.record,
    });

    return payload;
};

const postUpdatedSub = (next) => async (rp) => {
    const payload = await next(rp);

    await pubsub.publish("postUpdated", {
        postUpdated: payload.record,
    });

    return payload;
};

const postRemovedSub = (next) => async (rp) => {
    const payload = await next(rp);

    await pubsub.publish("postRemoved", {
        postRemoved: payload.record,
    });

    return payload;
};

const postVoteChangedSub = (next) => async (rp) => {
    const payload = await next(rp);

    await pubsub.publish("postVoteChanged", {
        postVoteChanged: payload.record,
    });

    return payload;
};

const PostQuery = {
    postById: PostDTC.getResolver("findById").withMiddlewares([checkLoggedIn]),

    postOne: PostDTC.getResolver("findOne").withMiddlewares([checkLoggedIn]),

    postCount: PostDTC.getResolver("count").withMiddlewares([checkLoggedIn]),

    postPagination: PostDTC.getResolver("pagination").withMiddlewares([
        checkLoggedIn,
    ]),
};

const PostMutation = {
    postCreateOne: PostDTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve(postCreatedSub),

    postUpdateById: PostDTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve(postUpdatedSub),

    upvotePostById: PostDTC.getResolver("upvotePost")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve(postVoteChangedSub),

    downvotePostById: PostDTC.getResolver("downvotePost")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve(postVoteChangedSub),

    postRemoveById: PostDTC.getResolver("removeById")
        .withMiddlewares([checkLoggedIn, userCheckPost])
        .wrapResolve(postRemovedSub),
};

const PostSubscription = {
    postCreated: {
        type: PostDTC.getDInterface(),

        subscribe: () => pubsub.asyncIterator("postCreated"),
    },

    postUpdated: {
        type: PostDTC.getDInterface(),

        subscribe: () => pubsub.asyncIterator("postUpdated"),
    },

    postVoteChanged: {
        type: PostDTC.getDInterface(),

        subscribe: () => pubsub.asyncIterator("postVoteChanged"),
    },

    postRemoved: {
        type: PostDTC.getDInterface(),

        subscribe: () => pubsub.asyncIterator("postRemoved"),
    },
};

export { PostQuery, PostMutation, PostSubscription };
