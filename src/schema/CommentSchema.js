import { CommentTC, PostDTC, UserTC } from "../models";

import {
    checkLoggedIn,
    userCheckComment,
    userCheckCreate,
} from "../utils/middlewares";

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
        post: 1,
    },
});

CommentTC.addRelation("parent", {
    resolver: () => CommentTC.getResolver("findById"),

    prepareArgs: {
        _id: (source) => source.parent,
    },

    projection: {
        parent: 1,
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
        parent: (source) => source._id,
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

    commentCount: CommentTC.getResolver("count").withMiddlewares([
        checkLoggedIn,
    ]),

    commentPagination: CommentTC.getResolver("pagination").withMiddlewares([
        checkLoggedIn,
    ]),
};

const CommentMutation = {
    commentCreateOne: CommentTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentCreated", {
                commentCreated: payload.record,
            });

            return payload;
        }),

    commentUpdateById: CommentTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckComment])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentUpdated", {
                commentCreated: payload.record,
            });

            return payload;
        }),

    commentRemoveById: CommentTC.getResolver("removeById")
        .withMiddlewares([checkLoggedIn, userCheckComment])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentRemoved", {
                commentUpdated: payload.record,
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
