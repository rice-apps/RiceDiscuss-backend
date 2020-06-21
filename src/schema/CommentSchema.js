import { CommentTC, PostDTC, UserTC } from "../models";

import { checkLoggedIn } from "../utils/middlewares";

import pubsub from "../pubsub";

CommentTC.addFields({
    children: [CommentTC],
});

CommentTC.addRelation("creator", {
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

CommentTC.addRelation("post", {
    resolver: () => PostDTC.getResolver("findById"),

    prepareArgs: {
        _id: (source) => source.post,
    },

    projection: {
        post_id: 1,
    },
});

CommentTC.addRelation("parent", {
    resolver: () => CommentTC.getResolver("findById"),

    prepareArgs: {
        _id: (source) => source.parent,
    },

    projection: {
        parent_id: 1,
    },
});

CommentTC.addRelation("upvotes", {
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

CommentTC.addRelation("downvotes", {
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

CommentTC.addRelation("children", {
    resolver: () => CommentTC.getResolver("findManyByParentID"),

    prepareArgs: {
        parent_id: (source) => source._id,
    },

    projection: {
        children: 1,
    },
});

const CommentQuery = {
    commentById: CommentTC.getResolver("findById").withMiddlewares([
        checkLoggedIn,
    ]),

    commentByParent: CommentTC.getResolver(
        "findManyByParentID",
    ).withMiddlewares([checkLoggedIn]),

    commentByPost: CommentTC.getResolver("findManyByPostID").withMiddlewares([
        checkLoggedIn,
    ]),

    commentOne: CommentTC.getResolver("findOne").withMiddlewares([
        checkLoggedIn,
    ]),

    commentMany: CommentTC.getResolver("findMany").withMiddlewares([
        checkLoggedIn,
    ]),

    commentCount: CommentTC.getResolver("count").withMiddlewares([
        checkLoggedIn,
    ]),

    commentPagination: CommentTC.getResolver("pagination").withMiddlewares([
        checkLoggedIn,
    ]),
};

const CommentMutation = {
    commentCreateOne: CommentTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentCreated", {
                commentCreated: payload.record,
            });

            return payload;
        }),

    commentUpdateById: CommentTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentUpdated", {
                commentCreated: payload.record,
            });

            return payload;
        }),

    commentUpdateOne: CommentTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentUpdated", {
                commentUpdated: payload.record,
            });

            return payload;
        }),

    commentUpdateMany: CommentTC.getResolver("updateMany")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentUpdated", {
                commentUpdated: payload.record,
            });

            return payload;
        }),

    commentRemoveById: CommentTC.getResolver("removeById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentRemoved", {
                commentUpdated: payload.record,
            });

            return payload;
        }),

    commentRemoveOne: CommentTC.getResolver("removeOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("commentRemoved", {
                commentRemoved: payload.record,
            });

            return payload;
        }),
};

const CommentSubscription = {
    commentCreated: {
        type: CommentTC,

        subscribe: () => pubsub.asyncIterator("commentCreated"),
    },

    commentUpdated: {
        type: CommentTC,

        subscribe: () => pubsub.asyncIterator("commentUpdated"),
    },

    commentRemoved: {
        type: CommentTC,

        subscribe: () => pubsub.asyncIterator("commentRemoved"),
    },
};

export { CommentQuery, CommentMutation, CommentSubscription };
