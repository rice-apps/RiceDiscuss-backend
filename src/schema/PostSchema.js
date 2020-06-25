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

const PostQuery = {
    postById: PostDTC.getResolver("findById").withMiddlewares([checkLoggedIn]),

    postOne: PostDTC.getResolver("findOne").withMiddlewares([checkLoggedIn]),

    postCount: PostDTC.getResolver("count").withMiddlewares([checkLoggedIn]),

    postPagination: PostDTC.getResolver("pagination").withMiddlewares([
        checkLoggedIn,
    ]),
};

const PostMutation = {
    discussionCreateOne: DiscussionTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("discussionCreated", {
                discussionCreated: payload.record,
            });

            return payload;
        }),

    eventCreateOne: EventTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("eventCreated", {
                eventCreated: payload.record,
            });

            return payload;
        }),

    noticeCreateOne: NoticeTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("noticeCreated", {
                noticeCreated: payload.record,
            });

            return payload;
        }),

    jobCreateOne: JobTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("jobCreated", { jobCreated: payload.record });

            return payload;
        }),

    discussionUpdateById: DiscussionTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("discussionUpdated", {
                discussionUpdated: payload.record,
            });

            return payload;
        }),

    eventUpdateById: EventTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("eventUpdated", {
                eventUpdated: payload.record,
            });

            return payload;
        }),

    noticeUpdateById: NoticeTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("noticeUpdated", {
                noticeUpdated: payload.record,
            });

            return payload;
        }),

    jobUpdateById: JobTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("jobUpdated", {
                jobUpdated: payload.record,
            });

            return payload;
        }),

    upvotePostById: PostDTC.getResolver("upvotePost")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("postUpvoted", {
                postUpvoted: payload,
            });

            return payload;
        }),

    downvotePostById: PostDTC.getResolver("downvotePost")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("postDownvoted", {
                postDownvoted: payload,
            });

            return payload;
        }),

    postRemoveById: PostDTC.getResolver("removeById")
        .withMiddlewares([checkLoggedIn, userCheckPost])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("postRemoved", {
                postRemoved: payload.record,
            });

            return payload;
        }),
};

const PostSubscription = {
    discussionUpdated: {
        type: DiscussionTC,

        subscribe: () => pubsub.asyncIterator("discussionUpdated"),
    },

    noticeUpdated: {
        type: NoticeTC,

        subscribe: () => pubsub.asyncIterator("noticeUpdated"),
    },

    eventUpdated: {
        type: EventTC,
        subscribe: () => pubsub.asyncIterator("eventUpdated"),
    },

    jobUpdated: {
        type: JobTC,
        subscribe: () => pubsub.asyncIterator("jobUpdated"),
    },

    discussionCreated: {
        type: DiscussionTC,

        subscribe: () => pubsub.asyncIterator("discussionCreated"),
    },

    noticeCreated: {
        type: NoticeTC,

        subscribe: () => pubsub.asyncIterator("noticeCreated"),
    },

    eventCreated: {
        type: EventTC,
        subscribe: () => pubsub.asyncIterator("eventCreated"),
    },

    jobCreated: {
        type: JobTC,
        subscribe: () => pubsub.asyncIterator("jobCreated"),
    },

    postUpvoted: {
        type: PostDTC,
        subscribe: () => pubsub.asyncIterator("postUpvoted"),
    },

    postDownvoted: {
        type: PostDTC,
        subscribe: () => pubsub.asyncIterator("postDownvoted"),
    },

    postRemoved: {
        type: PostDTC,
        subscribe: () => pubsub.asyncIterator("postRemoved"),
    },
};

export { PostQuery, PostMutation, PostSubscription };
