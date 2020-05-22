import {
    Discussion,
    CommentTC,
    PostDTC,
    DiscussionTC,
    EventTC,
    NoticeTC,
    JobTC,
    UserTC,
} from '../models';

import pubsub from '../pubsub';

DiscussionTC.addFields({
    comments: [CommentTC],
});

EventTC.addFields({
    comments: [CommentTC],
});

JobTC.addFields({
    comments: [CommentTC],
});

DiscussionTC.addRelation("comments", {
    "resolver": CommentTC.getResolver('findManyByPostID'),

    prepareArgs: {
        post_id: (source) => source._id,
    },

    projection: {
        comments: 1,
    },
});

EventTC.addRelation("comments", {
    "resolver": CommentTC.getResolver('findManyByPostID'),

    prepareArgs: {
        post_id: (source) => source._id,
    },

    projection: {
        comments: 1,
    },
});

JobTC.addRelation("comments", {
    "resolver": CommentTC.getResolver('findManyByPostID'),

    prepareArgs: {
        post_id: (source) => source._id,
    },

    projection: {
        comments: 1,
    },
});

PostDTC.addRelation("creator", {
    "resolver": () => UserTC.getResolver('findByNetID'),

    prepareArgs: {
        netID: (source) => source.creator,
        required: true,
    },

    projection: {
        creator: 1,
    },

});

const PostQuery = {
    discussionById: DiscussionTC.getResolver('findById'),
    eventById: EventTC.getResolver('findById'),
    noticeById: NoticeTC.getResolver('findById'),
    jobById: JobTC.getResolver('findById'),

    discussionByIds: DiscussionTC.getResolver('findByIds'),
    eventByIds: EventTC.getResolver('findByIds'),
    noticeByIds: NoticeTC.getResolver('findByIds'),
    jobByIds: JobTC.getResolver('findByIds'),

    discussionFindOne: DiscussionTC.getResolver('findOne'),
    eventFindOne: EventTC.getResolver('findOne'),
    noticeFindOne: NoticeTC.getResolver('findOne'),
    jobFindOne: JobTC.getResolver('findOne'),

    discussionMany: DiscussionTC.getResolver('findMany'),
    eventMany: EventTC.getResolver('findMany'),
    noticeMany: NoticeTC.getResolver('findMany'),
    jobMany: JobTC.getResolver('findMany'),

    discussionCount: DiscussionTC.getResolver('count'),
    eventCount: EventTC.getResolver('count'),
    noticeCount: NoticeTC.getResolver('count'),
    jobCount: JobTC.getResolver('count'),
};

const PostMutation = {
    discussionCreateOne: DiscussionTC.getResolver('createOne').wrapResolve(next => async rp => {
        const payload = await next(rp);

        pubsub.publish('discussionCreated', { discussionCreated: payload.record });

        return payload;
    }),
    eventCreateOne: EventTC.getResolver('createOne').wrapResolve(next => async rp => {
        const payload = await next(rp);

        pubsub.publish('eventCreated', { eventCreated: payload.record });

        return payload;
    }),
    noticeCreateOne: NoticeTC.getResolver('createOne').wrapResolve(next => async rp => {

        const payload = await next(rp);
        pubsub.publish('noticeCreated', { noticeCreated: payload.record });

        return payload;
    }),
    jobCreateOne: JobTC.getResolver('createOne').wrapResolve(next => async rp => {
        const payload = await next(rp);
        
        pubsub.publish('jobCreated', { jobCreated: payload.record });

        return payload;
    }),

    discussionCreateMany: DiscussionTC.getResolver('createMany'),
    eventCreateMany: EventTC.getResolver('createMany'),
    noticeCreateMany: NoticeTC.getResolver('createMany'),
    jobCreateMany: JobTC.getResolver('createMany'),

    discussionUpdateById: DiscussionTC.getResolver('updateById'),
    eventUpdateById: EventTC.getResolver('updateById'),
    noticeUpdateById: NoticeTC.getResolver('updateById'),
    jobUpdateById: JobTC.getResolver('updateById'),

    discussionUpdateOne: DiscussionTC.getResolver('updateOne').wrapResolve(next => async rp => {
        const payload = await next(rp);

        pubsub.publish('discussionUpdated', { discussionUpdated: payload.record });

        return payload;
    }),
    eventUpdateOne: EventTC.getResolver('updateOne').wrapResolve(next => async rp => {
        const payload = await next(rp);

        pubsub.publish('eventUpdated', { eventUpdated: payload.record });

        return payload;
    }),
    noticeUpdateOne: NoticeTC.getResolver('updateOne').wrapResolve(next => async rp => {
        const payload = await next(rp);

        pubsub.publish('noticeUpdated', { noticeUpdated: payload.record });

        return payload;
    }),
    jobUpdateOne: JobTC.getResolver('updateOne').wrapResolve(next => async rp => {
        const payload = await next(rp);

        pubsub.publish('jobUpdated', { jobUpdated: payload.record });

        return payload;
    }),

    discussionCreate: DiscussionTC.getResolver('createOne'),
    eventCreate: EventTC.getResolver('createOne'),
    noticeCreate: NoticeTC.getResolver('createOne'),
    jobCreate: JobTC.getResolver('createOne'),

    discussionUpdateMany: DiscussionTC.getResolver('updateMany'),
    eventUpdateMany: EventTC.getResolver('updateMany'),
    noticeUpdateMany: NoticeTC.getResolver('updateMany'),
    jobUpdateMany: JobTC.getResolver('updateMany'),

    postRemoveById: PostDTC.getResolver('removeById'),
    postRemoveOne: PostDTC.getResolver('removeOne').wrapResolve(next => async rp => {
        const payload = await next(rp);

        pubsub.publish('postRemoved', { postRemoved: payload.record });

        return payload;
    }),
    postRemoveMany: PostDTC.getResolver('removeMany'),

};

const PostSubscription = {
    discussionUpdated: {
        type: DiscussionTC,

        subscribe: () => pubsub.asyncIterator('discussionUpdated'),
    },

    noticeUpdated: {
        type: NoticeTC,

        subscribe: () => pubsub.asyncIterator('noticeUpdated'),
    },

    eventUpdated: {
        type: EventTC,
        subscribe: () => pubsub.asyncIterator('eventUpdated'),

    },

    jobUpdated: {
        type: JobTC,
        subscribe: () => pubsub.asyncIterator('jobUpdated'),

    },

    discussionCreated: {
        type: DiscussionTC,

        subscribe: () => pubsub.asyncIterator('discussionCreated'),
    },

    noticeCreated: {
        type: NoticeTC,

        subscribe: () => pubsub.asyncIterator('noticeCreated'),
    },

    eventCreated: {
        type: EventTC,
        subscribe: () => pubsub.asyncIterator('eventCreated'),

    },

    jobCreated: {
        type: JobTC,
        subscribe: () => pubsub.asyncIterator('jobCreated'),

    },

    postRemoved: {
        type: PostDTC,
        subscribe: () => pubsub.asyncIterator('postRemoved'),

    },

    // discussionUpdated: {
    //     type: DiscussionTC,

    // },

    // discussionUpdated: {
    //     type: DiscussionTC,

    // },

    // discussionUpdated: {
    //     type: DiscussionTC,

    // },

    // discussionUpdated: {
    //     type: DiscussionTC,

    // },

    // discussionUpdated: {
    //     type: DiscussionTC,

    // },
}

export {
    PostQuery,
    PostMutation,
    PostSubscription,
};
