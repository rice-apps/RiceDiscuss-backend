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
const PostSchema = mongoose.Schema({
    kind: {
        type: String,
        require: true,
        enum: Object.keys(enumPostType),
        description: 'The type of the post (whether event, discussion, or notice)'
    },

    creator: {
        type : String,
        required: true
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
        required: true
    },
    
    upvotes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            
        }], 
        required: true,
        default: []
    },
    
    downvotes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }], 
        required: true,
        default: []
    },

    tags: {
        type: [String],
        required: false,
        default: []
    }
});

// Schema definitions for enum types
const DiscussionSchema = mongoose.Schema({
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        required: true,
        default: []
    }
});

const NoticeSchema = mongoose.Schema({
    deadline: {
        type: Date,
        required: true
    }
});

const EventSchema = mongoose.Schema({
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        required: true,
        default: []
    },
    
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

const JobSchema = mongoose.Schema({
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        required: true,
        default: []
    },
    
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
export const PostDTC = composeWithMongooseDiscriminators(Post);

// Set the discriminiator for other sybtypes
export const Discussion = PostModel.discriminator(enumPostType.Discussion, DiscussionSchema);
export const Notice = PostModel.discriminator(enumPostType.Notice, NoticeSchema);
export const Event = PostModel.discriminator(enumPostType.Event, EventSchema);
export const Job = PostModel.discriminator(enumPostType.Job, JobSchema);

// TODO: add base options (https://graphql-compose.github.io/docs/plugins/plugin-mongoose.html#working-with-mongoose-collection-level-discriminators)
// for Discriminator models and possible for base model

export const DiscussionTC = PostDTC.discriminator(Discussion, {});
export const NoticeTC = PostDTC.discriminator(Notice, {});
export const EventTC = PostDTC.discriminator(Event, {});
export const JobTC = PostDTC.discriminator(Job, {});
