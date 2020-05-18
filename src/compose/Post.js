import mongoose from 'mongoose';
import { composeWithMongooseDiscriminators } from 'graphql-compose-mongoose';
import { schemaComposer } from 'graphql-compose';

// Create discriinator key
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
const PostModel = mongoose.model('Post', PostSchema);

// Set the discriminiator for other sybtypes
const DiscussionModel = PostModel.discriminator(enumPostType.Discussion, DiscussionSchema);
const NoticeModel = PostModel.discriminator(enumPostType.Notice, NoticeSchema);
const EventModel = PostModel.discriminator(enumPostType.Event, EventSchema);
const JobModel = PostModel.discriminator(enumPostType.Job, JobSchema);

// TODO: add base options (https://graphql-compose.github.io/docs/plugins/plugin-mongoose.html#working-with-mongoose-collection-level-discriminators)
// for Discriminator models and possible for base model

const PostDTC = composeWithMongooseDiscriminators(PostModel, {});

const DiscussionTC = PostDTC.discriminator(DiscussionModel, {});
const EventTC = PostDTC.discriminator(EventModel, {});
const NoticeTC = PostDTC.discriminator(NoticeModel, {});
const JobTC = PostDTC.discriminator(JobModel, {});

// Define the queries
schemaComposer.Query.addFields({
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
    jobMany: JobTc.getResolver('findMany'),
    
    discussionCount: DiscussionTC.getResolver('count'),
    eventCount: EventTC.getResolver('count'),
    noticeCount: NoticeTC.getResolver('count'),
    jobCount: JobTC.getResolver('count')

    // TODO: Review this because Post queries might override our other queries
    // postMany: PostDTC.getResolver('findMany'),
    // postById: PostDTC.getResolver('findById'),
    // postByIds: PostDTC.getResolver('findByIds')
});

// Define the mutations
schemaComposer.Mutation.addFields({
    discussionCreateOne: DiscussionTC.getResolver('createOne'),
    eventCreateOne: EventTC.getResolver('createOne'),
    noticeCreateOne: NoticeTC.getResolver('createOne'),
    jobCreateOne: JobTC.getResolver('createOne'),

    discussionCreateMany: DiscussionTC.getResolver('createMany'),
    eventCreateMany: EventTC.getResolver('createMany'),
    noticeCreateMany: NoticeTC.getResolver('createMany'),
    jobCreateMany: JobTC.getResolver('createMany'),

    discussionUpdateById: DiscussionTC.getResolver('updateById'),
    eventUpdateById: EventTC.getResolver('updateById'),
    noticeUpdateById: NoticeTC.getResolver('updateById'),
    jobUpdateById: JobTC.getResolver('updateById'),

    discussionUpdateOne: DiscussionTC.getResolver('updateOne'),
    eventUpdateOne: EventTC.getResolver('updateOne'),
    noticeUpdateOne: NoticeTC.getResolver('updateOne'),
    jobUpdateOne: JobTC.getResolver('updateOne'),

    discussionCreate: DiscussionTC.getResolver('createOne'),
    eventCreate: EventTC.getResolver('createOne'),
    noticeCreate: NoticeTC.getResolver('createOne'),
    jobCreate: JobTC.getResolver('createOne'),

    discussionUpdateMany: DiscussionTC.getResolver('updateMany'),
    eventUpdateMany: EventTC.getResolver('updateMany'),
    noticeUpdateMany: NoticeTC.getResolver('updateMany'),
    jobUpdateMany: JobTC.getResolver('updateMany'),

    // TODO: Again, check whether Post mutations follow object inheritance
    // discussionRemoveById: DiscussionTC.getResolver('removeById'),
    // eventRemoveById: EventTC.getResolver('removeById'),
    // noticeRemoveById: NoticeTC.getResolver('removeById'),

    // discussionRemoveOne: DiscussionTC.getResolver('createOne'),
    // eventRemoveOne: EventTC.getResolver('createOne'),
    // noticeRemoveOne: NoticeTC.getResolver('createOne'),

    // discussionRemoveMany: DiscussionTC.getResolver('createOne'),
    // eventRemoveMany: EventTC.getResolver('createOne'),
    // noticeRemoveMany: NoticeTC.getResolver('createOne'),
    
    postRemoveById: PostDTC.getResolver('removeById'),
    postRemoveOne: PostDTC.getResolver('removeOne'),    
    postRemoveMany: PostDTC.getResolver('removeMany')
    
});

const PostGQLSchema = schemaComposer.buildSchema();

export default PostGQLSchema;
