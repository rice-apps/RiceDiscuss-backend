import { UserTC, PostDTC, CommentTC } from "../models";

import {
    checkLoggedIn,
    userCheckUserFilter,
    userCheckUserId,
} from "../utils/middlewares";

import pubsub from "../pubsub";

UserTC.addFields({
    posts: [PostDTC],
    comments: [CommentTC],
});

UserTC.addRelation("posts", {
    resolver: PostDTC.getResolver("findManyByCreator"),

    prepareArgs: {
        creator: (source) => source.netID,
    },

    projection: {
        posts: 1,
    },
});

UserTC.addRelation("comments", {
    resolver: CommentTC.getResolver("findManyByCreator"),

    prepareArgs: {
        creator: (source) => source.netID,
    },

    projection: {
        comments: 1,
    },
});

const UserQuery = {
    userById: UserTC.getResolver("findById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => (rp) => {
            const resPromise = next(rp);

            resPromise.then((payload) => {
                if (payload.netID != rp.context.netID) {
                    payload.token = null;
                }
            });

            return resPromise;
        }),

    userOne: UserTC.getResolver("findOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => (rp) => {
            const resPromise = next(rp);

            resPromise.then((payload) => {
                if (payload.netID != rp.context.netID) {
                    payload.token = null;
                }
            });

            return resPromise;
        }),

    userCount: UserTC.getResolver("count")
        .withMiddlewares([checkLoggedIn]),

    userPagination: UserTC.getResolver("pagination")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => (rp) => {
            const resPromise = next(rp);

            resPromise.then((payload) => {
                for (let i = 0; i < payload.items.length; i++) {
                    if (payload.items[i].netID != rp.context.netID) {
                        payload.items[i].token = null;
                    }
                }
            });

            return resPromise;
        }),
};

const UserMutation = {
    userUpdateById: UserTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn, userCheckUserId])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileUpdated", {
                profileUpdated: payload.record,
            });

            return payload;
        }),

    userUpdateOne: UserTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn, userCheckUserFilter])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileUpdated", {
                profileUpdated: payload.record,
            });

            return payload;
        }),

    userRemoveById: UserTC.getResolver("removeById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileRemoved", {
                profileRemoved: payload.record,
            });

            return payload;
        }),

    userRemoveOne: UserTC.getResolver("removeOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileRemoved", {
                profileRemoved: payload.record,
            });

            return payload;
        }),
};

const UserSubscription = {
    profileCreated: {
        type: UserTC,

        subscribe: () => pubsub.asyncIterator("profileCreated"),
    },

    profileUpdated: {
        type: UserTC,

        subscribe: () => pubsub.asyncIterator("profileUpdated"),
    },

    profileRemoved: {
        type: UserTC,

        subscribe: () => pubsub.asyncIterator("profileRemoved"),
    },
};

export { UserQuery, UserMutation, UserSubscription };
