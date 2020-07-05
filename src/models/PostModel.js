import mongoose from "mongoose";
import { composeWithMongooseDiscriminators } from "graphql-compose-mongoose";

import composeDataloader from "../utils/dataloader";

import { DATALOADER_OPTIONS, DATALOADER_RESOLVERS } from "../config";

// Create discriminator key
const DKey = "kind";

// Create types of posts possible
const enumPostType = {
    Discussion: "Discussion",
    Event: "Event",
    Notice: "Notice",
    Job: "Job",
};

// Define base Post schema
const PostSchema = new mongoose.Schema({
    kind: {
        type: String,
        require: true,
        enum: Object.keys(enumPostType),
        description:
            "The type of the post (whether event, discussion, or notice)",
    },

    title: {
        type: String,
        required: true,
    },

    body: {
        type: String,
        required: true,
    },

    date_created: {
        type: Date,
        required: false,
        default: new Date().getTime(),
        index: true,
    },

    tags: {
        type: [String],
        required: false,
        default: [],
    },

    creator: {
        type: String,
        required: true,
    },

    upvotes: [
        {
            type: String,
        },
    ],

    downvotes: [
        {
            type: String,
        },
    ],

    reports: {
        type: Number,
        default: 0,
    },
});

// Schema definitions for enum types
const DiscussionSchema = new mongoose.Schema();

const NoticeSchema = new mongoose.Schema({
    deadline: {
        type: Date,
        required: true,
    },
});

const EventSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true,
    },

    end: {
        type: Date,
        required: true,
    },

    place: {
        type: String,
        required: false,
    },
});

const JobSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true,
    },

    end: {
        type: Date,
        required: true,
    },

    place: {
        type: String,
        required: true,
    },

    isPaid: {
        type: Boolean,
        required: true,
    },

    isClosed: {
        type: Boolean,
        required: true,
    },
});

// Set discriminator key and create the base model
PostSchema.set("discriminatorKey", DKey);

const Post = mongoose.model("Post", PostSchema);

// Set the discriminator for other subtypes
const Discussion = Post.discriminator(
    enumPostType.Discussion,
    DiscussionSchema,
);
const Notice = Post.discriminator(enumPostType.Notice, NoticeSchema);
const Event = Post.discriminator(enumPostType.Event, EventSchema);
const Job = Post.discriminator(enumPostType.Job, JobSchema);

// TODO: add base options (https://graphql-compose.github.io/docs/plugins/plugin-mongoose.html#working-with-mongoose-collection-level-discriminators)
// for Discriminator models and possible for base model

const PostDTC = composeWithMongooseDiscriminators(Post);

const DiscussionTC = PostDTC.discriminator(Discussion);
const NoticeTC = PostDTC.discriminator(Notice);
const EventTC = PostDTC.discriminator(Event);
const JobTC = PostDTC.discriminator(Job);

PostDTC.addResolver({
    name: "findManyByCreator",

    args: {
        creator: `String`,
    },

    type: [PostDTC.getDInterface()],

    resolve: async ({ args }) => {
        return Post.find({ creator: args.creator }).catch((err) =>
            console.log(err),
        );
    },
});

PostDTC.wrapResolverResolve(
    "updateById",
    (next) => async ({ source, args, context, info, projection }) => {
        return next({
            source: source,
            args: {
                ...args,
                record: {
                    ...args.record,
                    body:
                        args.record.report > 10
                            ? "[deleted]"
                            : args.record.body,
                },
            },
            context: context,
            info: info,
            projection: projection,
        });
    },
);

const PostDTCDL = composeDataloader(
    PostDTC,
    [...DATALOADER_RESOLVERS, ...["findManyByCreator"]],
    DATALOADER_OPTIONS,
);

const DiscussionTCDL = composeDataloader(
    DiscussionTC,
    DATALOADER_RESOLVERS,
    DATALOADER_OPTIONS,
);

const NoticeTCDL = composeDataloader(
    NoticeTC,
    DATALOADER_RESOLVERS,
    DATALOADER_OPTIONS,
);

const EventTCDL = composeDataloader(
    EventTC,
    DATALOADER_RESOLVERS,
    DATALOADER_OPTIONS,
);

const JobTCDL = composeDataloader(
    JobTC,
    DATALOADER_RESOLVERS,
    DATALOADER_OPTIONS,
);

export {
    Post,
    Discussion,
    Notice,
    Event,
    Job,
    PostDTCDL as PostDTC,
    DiscussionTCDL as DiscussionTC,
    NoticeTCDL as NoticeTC,
    EventTCDL as EventTC,
    JobTCDL as JobTC,
};
