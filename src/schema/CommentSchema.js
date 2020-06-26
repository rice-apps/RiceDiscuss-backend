import { CommentTC, PostDTC, UserTC, Comment } from "../models";

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
        _id: 1,
    },
});

CommentTC.addResolver({
    name: "upvoteComment",
    type: CommentTC,
    args: { _id: `ID!`, netID: `String!` },
    resolve: async ({ args, context }) => {
        if (args.netID != context.netID) {
            throw new Error("cannot upvote as someone else");
        }

        const comment = await Comment.findById(args._id);

        if (comment.upvotes.includes(args.netID)) {
            comment.upvotes = comment.upvotes.filter(
                (upvoter) => upvoter != args.netID,
            );
        } else if (comment.downvotes.includes(args.netID)) {
            comment.downvotes = comment.downvotes.filter(
                (downvoter) => downvoter != args.netID,
            );
            comment.upvotes.push(args.netID);
        } else {
            comment.upvotes.push(args.netID);
        }

        await comment.save();

        return comment;
    },
});

CommentTC.addResolver({
    name: "downvoteComment",
    type: CommentTC,
    args: { _id: `ID!`, netID: `String!` },
    resolve: async ({ args, context }) => {
        if (args.netID != context.netID) {
            throw new Error("cannot downvote as someone else");
        }

        const comment = await Comment.findById(args._id);

        if (comment.downvotes.includes(args.netID)) {
            comment.downvotes = comment.downvotes.filter(
                (downvoter) => downvoter != args.netID,
            );
        } else if (comment.upvotes.includes(args.netID)) {
            comment.upvotes = comment.upvotes.filter(
                (upvoter) => upvoter != args.netID,
            );
            comment.downvotes.push(args.netID);
        } else {
            comment.downvotes.push(args.netID);
        }

        await comment.save();

        return comment;
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

    upvoteCommentById: CommentTC.getResolver("upvoteComment")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentUpvoted", {
                commentUpvoted: payload,
            });

            return payload;
        }),

    downvoteCommentById: CommentTC.getResolver("downvoteComment")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("commentDownvoted", {
                commentDownvoted: payload,
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
