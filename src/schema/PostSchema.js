import log from "loglevel";
import { CommentTC, PostDTC, UserTC, Post } from "../models";
import {
    checkLoggedIn,
    userCheckPost,
    userCheckCreate,
    checkHTML,
    pubsub,
} from "../utils";

import { MAX_REPORTS } from "../config";

PostDTC.addFields({
    comments: [CommentTC],
})
    .addRelation("comments", {
        resolver: () => CommentTC.getResolver("findManyByPostID"),

        prepareArgs: {
            post: (source) => source._id,
        },

        projection: {
            _id: 1,
        },
    })
    .addRelation("creator", {
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
    })
    .addRelation("upvotes", {
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
    })
    .addRelation("downvotes", {
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
    })
    .addRelation("reports", {
        resolver: () => UserTC.getResolver("findMany"),

        prepareArgs: {
            filter: (source) => {
                return {
                    _operators: {
                        netID: {
                            in: source.reports,
                        },
                    },
                };
            },
        },

        projection: {
            reports: 1,
        },
    })
    .addResolver({
        name: "upvotePost",
        type: PostDTC.getDInterface(),
        args: { _id: "ID!", netID: "String!" },
        resolve: async ({ args, context }) => {
            if (args.netID !== context.netID) {
                return new Error("cannot upvote as someone else");
            }

            const post = await Post.findById(args._id)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    log.error(err);
                    return null;
                });

            if (post === null) {
                return new Error("trying to upvote nonexistent post");
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

            await post.save().catch((err) => log.error(err));

            return post;
        },
    })
    .addResolver({
        name: "downvotePost",
        type: PostDTC.getDInterface(),
        args: { _id: "ID!", netID: "String!" },
        resolve: async ({ args, context }) => {
            if (args.netID !== context.netID) {
                return new Error("cannot downvote as someone else");
            }

            const post = await Post.findById(args._id)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    log.error(err);
                    return null;
                });

            if (post === null) {
                return new Error("trying to upvote nonexistent post");
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

            await post.save().catch((err) => log.error(err));

            return post;
        },
    })
    .addResolver({
        name: "toggleReport",
        type: PostDTC.getDInterface(),
        args: { _id: "ID!", netID: "String!" },
        resolve: async ({ args, context }) => {
            if (args.netID !== context.netID) {
                return new Error("cannot report post as someone else");
            }

            const post = await Post.findById(args._id)
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    log.error(err);
                    return null;
                });

            if (post === null) {
                return new Error("trying to report nonexistent post");
            }

            if (post.reports.includes(args.netID)) {
                post.reports = post.reports.filter(
                    (reporter) => reporter !== args.netID,
                );
            } else {
                post.reports.push(args.netID);
            }

            await post.save().catch((err) => log.error(err));

            return post;
        },
    });

const PostQuery = {
    postById: PostDTC.getResolver("findById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next({
                ...rp,
                projection: { reports: {}, ...rp.projection },
            });

            if (payload.record.reports.length > MAX_REPORTS) {
                if (payload.record.body) {
                    payload.record.body = "[This post has been removed.]";
                }

                if (payload.record.title) {
                    payload.record.title = "[This post has been removed.]";
                }
            }

            return payload;
        }),

    postOne: PostDTC.getResolver("findOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next({
                ...rp,
                projection: { reports: {}, ...rp.projection },
            });

            if (payload.record.reports.length > MAX_REPORTS) {
                if (payload.record.body) {
                    payload.record.body = "[This post has been removed.]";
                }

                if (payload.record.title) {
                    payload.record.title = "[This post has been removed.]";
                }
            }

            return payload;
        }),

    postCount: PostDTC.getResolver("count").withMiddlewares([checkLoggedIn]),

    postPagination: PostDTC.getResolver("pagination")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next({
                ...rp,
                projection: { reports: {}, ...rp.projection },
            });

            for (let i = 0; i < payload.items.length; i += 1) {
                if (payload.items[i].reports.length > MAX_REPORTS) {
                    if (payload.items[i].body) {
                        payload.items[i].body = "[This post has been removed.]";
                    }

                    if (payload.items[i].title) {
                        payload.items[i].title =
                            "[This post has been removed.]";
                    }
                }
            }

            return payload;
        }),
};

const PostMutation = {
    postCreateOne: PostDTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("postCreated", {
                postCreated: payload.record,
            });

            return payload;
        }),

    postUpdateById: PostDTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("postUpdated", {
                postUpdated: payload.record,
            });

            return payload;
        }),

    upvotePostById: PostDTC.getResolver("upvotePost")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("postVoteChanged", {
                postVoteChanged: payload,
            });

            return payload;
        }),

    downvotePostById: PostDTC.getResolver("downvotePost")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("postVoteChanged", {
                postVoteChanged: payload,
            });

            return payload;
        }),

    togglePostReport: PostDTC.getResolver("toggleReport")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            if (rp.args.record.reports) {
                if (rp.args.record.reports.length > MAX_REPORTS) {
                    rp.args.record.body = "[This post has been removed.]";
                    rp.args.record.title = "[This post has been removed.]";
                }
            }

            const payload = await next(rp);

            pubsub.publish("postReported", {
                postReported: payload,
            });

            return payload;
        }),

    postRemoveById: PostDTC.getResolver("removeById")
        .withMiddlewares([checkLoggedIn, userCheckPost])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("postRemoved", {
                postRemoved: payload.record,
            });

            return payload;
        }),
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

    postReported: {
        type: PostDTC.getDInterface(),

        subscribe: () => pubsub.asyncIterator("postReported"),
    },

    postRemoved: {
        type: PostDTC.getDInterface(),

        subscribe: () => pubsub.asyncIterator("postRemoved"),
    },
};

export { PostQuery, PostMutation, PostSubscription };
