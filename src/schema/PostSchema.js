import {
    CommentTC,
    PostDTC,
    DiscussionTC,
    EventTC,
    NoticeTC,
    JobTC,
    UserTC,
    Post,
} from "../models";

import {
    checkLoggedIn,
    userCheckPost,
    userCheckCreate,
    checkHTML,
} from "../utils/middlewares";

import pubsub from "../pubsub";

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
        required: true,
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
    type: PostDTC,
    args: { _id: `ID!`, netID: `String!` },
    resolve: async ({ args, context }) => {
        if (args.netID != context.netID) {
            throw new Error("cannot upvote as someone else");
        }

        const post = await Post.findById(args._id);

        if (post.upvotes.includes(args.netID)) {
            post.upvotes = post.upvotes.filter(
                (upvoter) => upvoter != args.netID,
            );
        } else if (post.downvotes.includes(args.netID)) {
            post.downvotes = post.downvotes.filter(
                (downvoter) => downvoter != args.netID,
            );
            post.upvotes.push(args.netID);
        } else {
            post.upvotes.push(args.netID);
        }

        await post.save();

        return post;
    },
});

PostDTC.addResolver({
    name: "downvotePost",
    type: PostDTC,
    args: { _id: `ID!`, netID: `String!` },
    resolve: async ({ args, context }) => {
        if (args.netID != context.netID) {
            throw new Error("cannot downvote as someone else");
        }

        const post = await Post.findById(args._id);

        if (post.downvotes.includes(args.netID)) {
            post.downvotes = post.downvotes.filter(
                (downvoter) => downvoter != args.netID,
            );
        } else if (post.upvotes.includes(args.netID)) {
            post.upvotes = post.upvotes.filter(
                (upvoter) => upvoter != args.netID,
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
    postCreateOne: PostDTC.getResolver("createOne"),
    discussionCreateOne: DiscussionTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve(postCreatedSub),

    eventCreateOne: EventTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve(postCreatedSub),

    noticeCreateOne: NoticeTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve(postCreatedSub),

    jobCreateOne: JobTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve(postCreatedSub),

    discussionUpdateById: DiscussionTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve(postUpdatedSub),

    eventUpdateById: EventTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve(postUpdatedSub),

    noticeUpdateById: NoticeTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve(postUpdatedSub),

    jobUpdateById: JobTC.getResolver("updateById")
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
