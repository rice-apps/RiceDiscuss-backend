import { 
    CommentTC,
    PostDTC,
    UserTC,
} from '../models';

CommentTC.addRelation("post", {
    'resolver': () => PostDTC.getResolver('findById'),

    prepareArgs: {
        _id: (source) => source.post,
    },

    projection: {
        post: 1,
    },
});

CommentTC.addRelation("user", {
    'user': () => UserTC.getResolver('findById'),

    prepareArgs: {
        _id: (source) => source.user,
    },

    projection: {
        user: 1,
    },
});
