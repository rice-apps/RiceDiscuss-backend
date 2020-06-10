import { CommentTC, PostDTC, UserTC } from "../models";

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

CommentTC.addRelation("post_id", {
    resolver: () => PostDTC.getResolver("findById"),

    prepareArgs: {
        _id: (source) => source.post_id,
    },

    projection: {
        post_id: 1,
    },
});

CommentTC.addRelation("parent_id", {
    resolver: () => CommentTC.getResolver("findById"),

    prepareArgs: {
        _id: (source) => source.parent_id,
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
    commentById: CommentTC.getResolver("findById"),
    commentByParent: CommentTC.getResolver("findManyByParentID"),
    commentByPost: CommentTC.getResolver("findManyByPostID"),
    commentOne: CommentTC.getResolver("findOne"),
    commentMany: CommentTC.getResolver("findMany"),
    commentCount: CommentTC.getResolver("count"),
};

const CommentMutation = {
    commentCreateOne: CommentTC.getResolver("createOne").wrapResolve(
        (next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentCreated", {
                commentCreated: payload.record,
            });

            return payload;
        },
    ),
    commentUpdateById: CommentTC.getResolver("updateById"),
    commentUpdateOne: CommentTC.getResolver("updateOne").wrapResolve(
        (next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentUpdated", {
                commentUpdated: payload.record,
            });

            return payload;
        },
    ),
    commentUpdateMany: CommentTC.getResolver("updateMany"),
    commentRemoveById: CommentTC.getResolver("removeById"),
    commentRemoveOne: CommentTC.getResolver("removeOne").wrapResolve(
        (next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("commentRemoved", {
                commentRemoved: payload.record,
            });

            return payload;
        },
    ),
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
