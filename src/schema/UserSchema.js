import { UserTC, PostDTC, CommentTC } from "../models";

import { checkLoggedIn } from "../utils/middlewares";

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
    userById: UserTC.getResolver("findById").withMiddlewares([checkLoggedIn]),
    userOne: UserTC.getResolver("findOne").withMiddlewares([checkLoggedIn]),
    userMany: UserTC.getResolver("findMany").withMiddlewares([checkLoggedIn]),
    userCount: UserTC.getResolver("count").withMiddlewares([checkLoggedIn]),
};

const UserMutation = {
    userCreateOne: UserTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileCreated", {
                profileCreated: payload.record,
            });

            return payload;
        }),
    userUpdateById: UserTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileUpdated", {
                profileUpdated: payload.record,
            });

            return payload;
        }),
    userUpdateOne: UserTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileUpdated", {
                profileUpdated: payload.record,
            });

            return payload;
        }),
    userUpdateMany: UserTC.getResolver("updateMany")
        .withMiddlewares([checkLoggedIn])
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
