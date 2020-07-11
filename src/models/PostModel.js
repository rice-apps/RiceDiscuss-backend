import { composeWithMongooseDiscriminators } from "graphql-compose-mongoose";
import log from "loglevel";
import mongoose from "mongoose";
import { toInputObjectType } from "graphql-compose";

const DKey = "kind";

const enumPostType = {
    Discussion: "Discussion",
    Event: "Event",
    Notice: "Notice",
    Job: "Job",
};

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

PostSchema.set("discriminatorKey", DKey);

const Post = mongoose.model("Post", PostSchema);

const Discussion = Post.discriminator(
    enumPostType.Discussion,
    DiscussionSchema,
);
const Notice = Post.discriminator(enumPostType.Notice, NoticeSchema);
const Event = Post.discriminator(enumPostType.Event, EventSchema);
const Job = Post.discriminator(enumPostType.Job, JobSchema);

const PostDTC = composeWithMongooseDiscriminators(Post);

const DiscussionTC = PostDTC.discriminator(Discussion);
const NoticeTC = PostDTC.discriminator(Notice);
const EventTC = PostDTC.discriminator(Event);
const JobTC = PostDTC.discriminator(Job);

PostDTC.getDInterface()
    .addTypeResolver(
        DiscussionTC,
        (value) => value.kind === enumPostType.Discussion,
    )
    .addTypeResolver(EventTC, (value) => value.kind === enumPostType.Event)
    .addTypeResolver(JobTC, (value) => value.kind === enumPostType.Job)
    .addTypeResolver(NoticeTC, (value) => value.kind === enumPostType.Notice);

PostDTC.getResolver("createOne")
    .getArgITC("record")
    .merge(toInputObjectType(DiscussionTC).removeField("kind"))
    .merge(
        toInputObjectType(EventTC)
            .removeField("kind")
            .makeOptional(["start", "end", "place"]),
    )
    .merge(
        toInputObjectType(JobTC)
            .removeField("kind")
            .makeOptional(["start", "end", "place", "isPaid", "isClosed"]),
    )
    .merge(
        toInputObjectType(NoticeTC)
            .removeField("kind")
            .makeOptional(["deadline"]),
    );

PostDTC.getResolver("updateById")
    .getArgITC("record")
    .merge(
        toInputObjectType(DiscussionTC)
            .removeField("kind")
            .makeOptional(DiscussionTC.getFieldNames()),
    )
    .merge(
        toInputObjectType(EventTC)
            .removeField("kind")
            .makeOptional(EventTC.getFieldNames()),
    )
    .merge(
        toInputObjectType(JobTC)
            .removeField("kind")
            .makeOptional(JobTC.getFieldNames()),
    )
    .merge(
        toInputObjectType(NoticeTC)
            .removeField("kind")
            .makeOptional(NoticeTC.getFieldNames()),
    )
    .makeRequired("_id");

PostDTC.addResolver({
    name: "findManyByCreator",

    args: {
        creator: `String`,
    },

    type: [PostDTC.getDInterface()],

    resolve: ({ args }) =>
        Post.find({ creator: args.creator })
            .then((res) => res)
            .catch((err) => {
                log.error(err);
                return new Error(`Search failed: ${err}`);
            }),
});

export {
    Post,
    Discussion,
    Notice,
    Event,
    Job,
    PostDTC,
    DiscussionTC,
    NoticeTC,
    EventTC,
    JobTC,
};
