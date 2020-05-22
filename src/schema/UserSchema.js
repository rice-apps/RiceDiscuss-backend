import {
    UserTC,
    PostDTC,
    CommentTC,
} from '../models';

import pubsub from '../pubsub';

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
    userById: UserTC.getResolver('findById'),
    userByIds: UserTC.getResolver('findByIds'),
    userByNetID: UserTC.getResolver('findByNetID'),
    userManyByNetID: UserTC.getResolver('findManyByNetID'),
    userOne: UserTC.getResolver('findOne'),
    userMany: UserTC.getResolver('findMany'),
    userCount: UserTC.getResolver('count'),
};

const UserMutation = {
    userCreateOne: UserTC.getResolver('createOne'),
    userCreateMany: UserTC.getResolver('createMany'),
    userUpdateById: UserTC.getResolver('updateById'),
    userUpdateByNetID: UserTC.getResolver('updateByNetID'),
    userUpdateByNetID: UserTC.getResolver('updateByNetID'),
    userUpdateOne: UserTC.getResolver('updateOne').wrapResolve(next => rp => {
        pubsub.publish('profileUpdated', {
            profileUpdated: rp.args.record,
        });

        return next(rp);
    }),
    userUpdateMany: UserTC.getResolver('updateMany'),
    userRemoveByNetID: UserTC.getResolver('removeByNetID'),
    userRemoveById: UserTC.getResolver('removeById'),
    userRemoveByNetID: UserTC.getResolver('removeByNetID'),
    userRemoveOne: UserTC.getResolver('removeOne'),
    userRemoveMany: UserTC.getResolver('removeMany'),
};

const UserSubscription = {
    profileUpdated: {
        type: UserTC,

        subscribe: () => pubsub.asyncIterator('profileUpdated'),
    }
};

export {
    UserQuery,
    UserMutation,
    UserSubscription,
};
