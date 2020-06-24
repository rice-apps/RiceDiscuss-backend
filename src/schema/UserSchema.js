import { UserTC, PostDTC, CommentTC, User } from "../models";

import { checkWithCAS, createToken, isTokenExpired } from "../utils/auth";

import { checkLoggedIn, userCheckUserFilter } from "../utils/middlewares";

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

UserTC.addResolver({
    name: "authenticate",
    type: UserTC,
    args: { ticket: `String!` },
    resolve: async ({ args }) => {
        const payload = {
            success: false,
        };

        const res = await checkWithCAS(args.ticket);

        if (res.success) {
            let user;
            payload.isNewUser = !(await User.exists({ netID: res.netID }));

            if (payload.isNewUser) {
                user = await User.create({
                    netID: res.netID,
                    username: res.netID,
                });

                user.token = createToken(user);

                await user.save();
            } else {
                user = await User.findOne({ netID: res.netID });

                if (isTokenExpired(user)) {
                    user.token = createToken(user);

                    await user.save();
                }
            }

            payload.success = true;

            payload.user = {
                _id: user._id,
                netID: user.netID,
                token: user.token,
            };
        }

        return payload;
    },
});

const UserQuery = {
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
    userUpdateOne: UserTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn, userCheckUserFilter])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("profileUpdated", {
                profileUpdated: payload.record,
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
