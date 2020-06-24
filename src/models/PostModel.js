import mongoose from "mongoose";
import { composeWithMongooseDiscriminators } from "graphql-compose-mongoose";

import composeDataloader from "../utils/dataloader";

import {
    PAGINATION_OPTIONS,
    DATALOADER_OPTIONS,
    DATALOADER_RESOLVERS,
} from "../config";

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
        required: false,
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

const PostDTC = composeWithMongooseDiscriminators(Post, PAGINATION_OPTIONS);

const DiscussionTC = PostDTC.discriminator(Discussion, PAGINATION_OPTIONS);
const NoticeTC = PostDTC.discriminator(Notice, PAGINATION_OPTIONS);
const EventTC = PostDTC.discriminator(Event, PAGINATION_OPTIONS);
const JobTC = PostDTC.discriminator(Job, PAGINATION_OPTIONS);

PostDTC.addResolver({
    name: "findManyByCreator",

    args: {
        creator: `String`,
    },

    type: [PostDTC],

    resolve: async ({ args }) => {
        return Post.find({ creator: args.creator });
    },
});

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
