import {
    CommentTC,
    PostDTC,
    DiscussionTC,
    EventTC,
    NoticeTC,
    JobTC,
    UserTC,
} from "../models";

import { checkLoggedIn } from "../utils/middlewares";

import pubsub from "../pubsub";

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
    resolver: CommentTC.getResolver("findManyByPostID"),

    prepareArgs: {
        post_id: (source) => source._id,
    },

    projection: {
        comments: 1,
    },
});

EventTC.addRelation("comments", {
    resolver: CommentTC.getResolver("findManyByPostID"),

    prepareArgs: {
        post_id: (source) => source._id,
    },

    projection: {
        comments: 1,
    },
});

JobTC.addRelation("comments", {
    resolver: CommentTC.getResolver("findManyByPostID"),

    prepareArgs: {
        post_id: (source) => source._id,
    },

    projection: {
        comments: 1,
    },
});

PostDTC.addRelation("creator", {
    resolver: () => UserTC.getResolver("findOne"),

    prepareArgs: {
        filter: (source) => {
            return {
                netID: source.creator,
            };
        },
        required: true,
    },

    projection: {
        creator: 1,
    },
});

const PostQuery = {
    discussionById: DiscussionTC.getResolver("findById").withMiddlewares([
        checkLoggedIn,
    ]),
    eventById: EventTC.getResolver("findById").withMiddlewares([checkLoggedIn]),
    noticeById: NoticeTC.getResolver("findById").withMiddlewares([
        checkLoggedIn,
    ]),
    jobById: JobTC.getResolver("findById").withMiddlewares([checkLoggedIn]),

    discussionFindOne: DiscussionTC.getResolver("findOne").withMiddlewares([
        checkLoggedIn,
    ]),
    eventFindOne: EventTC.getResolver("findOne").withMiddlewares([
        checkLoggedIn,
    ]),
    noticeFindOne: NoticeTC.getResolver("findOne").withMiddlewares([
        checkLoggedIn,
    ]),
    jobFindOne: JobTC.getResolver("findOne").withMiddlewares([checkLoggedIn]),

    discussionMany: DiscussionTC.getResolver("findMany").withMiddlewares([
        checkLoggedIn,
    ]),
    eventMany: EventTC.getResolver("findMany").withMiddlewares([checkLoggedIn]),
    noticeMany: NoticeTC.getResolver("findMany").withMiddlewares([
        checkLoggedIn,
    ]),
    jobMany: JobTC.getResolver("findMany").withMiddlewares([checkLoggedIn]),

    discussionCount: DiscussionTC.getResolver("count").withMiddlewares([
        checkLoggedIn,
    ]),
    eventCount: EventTC.getResolver("count").withMiddlewares([checkLoggedIn]),
    noticeCount: NoticeTC.getResolver("count").withMiddlewares([checkLoggedIn]),
    jobCount: JobTC.getResolver("count").withMiddlewares([checkLoggedIn]),
};

const PostMutation = {
    discussionCreateOne: DiscussionTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("discussionCreated", {
                discussionCreated: payload.record,
            });

            return payload;
        }),
    eventCreateOne: EventTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("eventCreated", {
                eventCreated: payload.record,
            });

            return payload;
        }),
    noticeCreateOne: NoticeTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);
            await pubsub.publish("noticeCreated", {
                noticeCreated: payload.record,
            });

            return payload;
        }),
    jobCreateOne: JobTC.getResolver("createOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("jobCreated", { jobCreated: payload.record });

            return payload;
        }),

    discussionUpdateById: DiscussionTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("discussionUpdated", {
                discussionUpdated: payload.record,
            });

            return payload;
        }),
    eventUpdateById: EventTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("eventUpdated", {
                eventUpdated: payload.record,
            });

            return payload;
        }),
    noticeUpdateById: NoticeTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("noticeUpdated", {
                noticeUpdated: payload.record,
            });

            return payload;
        }),
    jobUpdateById: JobTC.getResolver("updateById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("jobUpdated", {
                jobUpdated: payload.record,
            });

            return payload;
        }),

    discussionUpdateOne: DiscussionTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("discussionUpdated", {
                discussionUpdated: payload.record,
            });

            return payload;
        }),
    eventUpdateOne: EventTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("eventUpdated", {
                eventUpdated: payload.record,
            });

            return payload;
        }),
    noticeUpdateOne: NoticeTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("noticeUpdated", {
                noticeUpdated: payload.record,
            });

            return payload;
        }),
    jobUpdateOne: JobTC.getResolver("updateOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("jobUpdated", { jobUpdated: payload.record });

            return payload;
        }),

    postRemoveById: PostDTC.getResolver("removeById")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            await pubsub.publish("postRemoved", {
                postRemoved: payload.record,
            });

            return payload;
        }),
    postRemoveOne: PostDTC.getResolver("removeOne")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("postRemoved", { postRemoved: payload.record });

            return payload;
        }),
    postRemoveMany: PostDTC.getResolver("removeMany")
        .withMiddlewares([checkLoggedIn])
        .wrapResolve((next) => async (rp) => {
            const payload = await next(rp);

            pubsub.publish("postRemoved", {
                postRemoved: payload.record,
            });

            return payload;
        }),
};

const PostSubscription = {
    discussionUpdated: {
        type: DiscussionTC,

        subscribe: () => pubsub.asyncIterator("discussionUpdated"),
    },

    noticeUpdated: {
        type: NoticeTC,

        subscribe: () => pubsub.asyncIterator("noticeUpdated"),
    },

    eventUpdated: {
        type: EventTC,
        subscribe: () => pubsub.asyncIterator("eventUpdated"),
    },

    jobUpdated: {
        type: JobTC,
        subscribe: () => pubsub.asyncIterator("jobUpdated"),
    },

    discussionCreated: {
        type: DiscussionTC,

        subscribe: () => pubsub.asyncIterator("discussionCreated"),
    },

    noticeCreated: {
        type: NoticeTC,

        subscribe: () => pubsub.asyncIterator("noticeCreated"),
    },

    eventCreated: {
        type: EventTC,
        subscribe: () => pubsub.asyncIterator("eventCreated"),
    },

    jobCreated: {
        type: JobTC,
        subscribe: () => pubsub.asyncIterator("jobCreated"),
    },

    postRemoved: {
        type: PostDTC,
        subscribe: () => pubsub.asyncIterator("postRemoved"),
    },
};

export { PostQuery, PostMutation, PostSubscription };
