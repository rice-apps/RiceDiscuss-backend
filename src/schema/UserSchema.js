import log from "loglevel";
import { UserTC, PostDTC, CommentTC, User } from "../models";
import {
    checkWithCAS,
    createToken,
    isTokenExpired,
    checkLoggedIn,
    userCheckUserFilter,
    pubsub,
} from "../utils";

UserTC.addFields({
    posts: [PostDTC.getDInterface()],
    comments: [CommentTC],
})
    .addRelation("posts", {
        resolver: () => PostDTC.getResolver("findManyByCreator"),

        prepareArgs: {
            creator: (source) => source.netID,
        },

        projection: {
            netID: 1,
        },
    })
    .addRelation("comments", {
        resolver: () => CommentTC.getResolver("findManyByCreator"),

        prepareArgs: {
            creator: (source) => source.netID,
        },

        projection: {
            netID: 1,
        },
    })
    .addResolver({
        name: "authenticate",
        type: UserTC,
        args: { ticket: "String!" },
        resolve: async ({ args }) => {
            const res = await checkWithCAS(args.ticket);

            if (res.success) {
                const isNewUser = !(await User.exists({
                    netID: res.netID,
                }).catch((err) => log.error(err)));

                return isNewUser
                    ? User.create({ netID: res.netID, username: res.netID })
                          .then((doc) => {
                              doc.token = createToken(doc);

                              return doc.save();
                          })
                          .catch(
                              (err) =>
                                  new Error(`User creation failed: ${err}`),
                          )
                    : User.findOne({ netID: res.netID })
                          .then((doc) => {
                              if (isTokenExpired(doc)) {
                                  doc.token = createToken(doc);
                              }

                              return doc.save();
                          })
                          .catch(
                              (err) =>
                                  new Error(`User creation failed: ${err}`),
                          );
            }

            return null;
        },
    });

const UserQuery = {
    userOne: UserTC.getResolver("findOne").withMiddlewares([checkLoggedIn]),

    userPagination: UserTC.getResolver("pagination").withMiddlewares([
        checkLoggedIn,
    ]),
};

const UserMutation = {
    userAuthentication: UserTC.getResolver("authenticate"),

    userUpdateOne: UserTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn, userCheckUserFilter])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("profileUpdated", {
                profileUpdated: payload.record,
            });

            return payload;
        }),

    userRemoveOne: UserTC.getResolver("removeOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("profileRemoved", {
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
