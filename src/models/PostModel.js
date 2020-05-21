import mongoose from 'mongoose';
import { composeWithMongooseDiscriminators } from 'graphql-compose-mongoose';

// Create discriminator key
const DKey = 'kind';

// Create types of posts possible
const enumPostType = {
    Discussion: 'Discussion',
    Event: 'Event',
    Notice: 'Notice',
    Job: 'Job'
};

// Define base Post schema
const PostSchema = new mongoose.Schema({
    kind: {
        type: String,
        require: true,
        enum: Object.keys(enumPostType),
        description: 'The type of the post (whether event, discussion, or notice)'
    },

    title: {
        type: String,
        required: true
    },
    
    body: {
        type: String,
        required: true
    },
    
    date_created: {
        type: Date,
        required: false,
        default: (new Date()).getTime(),
    },

    tags: {
        type: [String],
        required: false,
        default: []
    }
});

// Schema definitions for enum types
const DiscussionSchema = new mongoose.Schema();

const NoticeSchema = new mongoose.Schema({
    deadline: {
        type: Date,
        required: true
    }
});

const EventSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true
    },

    end: {
        type: Date,
        required: true
    },

    place: {
        type: String,
        required: false
    }
});

const JobSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true
    },

    end: {
        type: Date,
        required: true
    },

    place: {
        type: String,
        required: true
    },

    isPaid: {
        type: Boolean,
        required: true
    },

    isClosed: {
        type: Boolean,
        required: true
    }
});

// Set discriminator key and create the base model
PostSchema.set('discriminatorKey', DKey);

export const Post = mongoose.model('Post', PostSchema);

// Set the discriminiator for other sybtypes
export const Discussion = Post.discriminator(enumPostType.Discussion, DiscussionSchema);
export const Notice = Post.discriminator(enumPostType.Notice, NoticeSchema);
export const Event = Post.discriminator(enumPostType.Event, EventSchema);
export const Job = Post.discriminator(enumPostType.Job, JobSchema);

// TODO: add base options (https://graphql-compose.github.io/docs/plugins/plugin-mongoose.html#working-with-mongoose-collection-level-discriminators)
// for Discriminator models and possible for base model

export const PostDTC = composeWithMongooseDiscriminators(Post);

export const DiscussionTC = PostDTC.discriminator(Discussion, {});
export const NoticeTC = PostDTC.discriminator(Notice, {});
export const EventTC = PostDTC.discriminator(Event, {});
export const JobTC = PostDTC.discriminator(Job, {});
