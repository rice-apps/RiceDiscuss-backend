import { 
    CommentTC,
    PostDTC,
    UserTC,
} from '../models';

CommentTC.addFields({
    upvotes: [UserTC],
    downvotes: [UserTC],
    children: [CommentTC],
});

CommentTC.addRelation("creator", {
    "resolver": () => UserTC.getResolver('findById'),
    
    prepareArgs: {
        _id: (source) => source.creator,
    },

    projection: {
        creator: 1,
    },
});

CommentTC.addRelation("post_id", {
    "resolver": () => PostDTC.getResolver('findById'),

    prepareArgs: {
        _id: (source) => source.post_id,
    },

    projection: {
        post_id: 1,
    },
});

CommentTC.addRelation("parent_id", {
    "resolver": () => CommentTC.getResolver('findById'),

    prepareArgs: {
        _id: (source) => source.parent_id,
    },

    projection: {
        parent_id: 1,
    },
});

CommentTC.addRelation("upvotes", {
    "resolver": () => UserTC.getResolver('findMany'),

    prepareArgs: {
        _id: (source) => source._id,
    },

    projection: {
        upvotes: 1,
    },
});

CommentTC.addRelation("downvotes", {
    "resolver": () => UserTC.getResolver('findMany'),

    prepareArgs: {
        _id: (source) => source._id,
    },

    projection: {
        downvotes: 1,
    },
});

CommentTC.addRelation("children", {
    "resolver": () => CommentTC.getResolver('findMany'),

    prepareArgs: {
        _id: (source) => source._id,
    },

    projection: {
        children: 1,
    },
});

const CommentQuery = {
    commentById: CommentTC.getResolver('findById'),
    commentByIds: CommentTC.getResolver('findByIds'),
    commentOne: CommentTC.getResolver('findOne'),
    commentMany: CommentTC.getResolver('findMany'),
    commentCount: CommentTC.getResolver('count'),
};

const CommentMutation = {
    commentCreateOne: CommentTC.getResolver('createOne'),
    commentCreateMany: CommentTC.getResolver('createMany'),
    commentUpdateById: CommentTC.getResolver('updateById'),
    commentUpdateOne: CommentTC.getResolver('updateOne'),
    commentUpdateMany: CommentTC.getResolver('updateMany'),
    commentRemoveById: CommentTC.getResolver('removeById'),
    commentRemoveOne: CommentTC.getResolver('removeOne'),
    commentRemoveMany: CommentTC.getResolver('removeMany'),
};

export {
    CommentQuery,
    CommentMutation,
};
