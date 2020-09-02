import { ApolloError } from 'apollo-server-express'
import { composeWithMongooseDiscriminators } from 'graphql-compose-mongoose'
import log from 'loglevel'
import { Schema, model } from 'mongoose'
import { toInputObjectType } from 'graphql-compose'

import { UrlTC } from './CustomTypes'

const DKey = 'kind'

const enumPostType = {
  Discussion: 'Discussion',
  Event: 'Event',
  Notice: 'Notice',
  Job: 'Job'
}

const PostSchema = new Schema(
  {
    kind: {
      type: String,
      require: true,
      enum: Object.keys(enumPostType),
      description:
        'The type of the post (whether discussion, event, job, or notice)'
    },

    title: {
      type: String,
      required: true
    },

    body: {
      type: String,
      required: true
    },

    text_align: {
      type: String,
      default: 'left'
    },

    date_created: {
      type: Date,
      default: new Date().getTime(),
      index: true
    },

    tags: {
      type: [String],
      default: []
    },

    creator: {
      type: String,
      required: true
    },

    upvotes: {
      type: [String],
      default: []
    },

    downvotes: {
      type: [String],
      default: []
    },

    reports: {
      type: [String],
      default: []
    },

    imageUrl: {
      type: String,
      validate: {
        validator: testUrl =>
          testUrl
            ? /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(
                testUrl
              )
            : true,
        message: props => `${props.value} is not a valid URL!`
      },
      required: false
    }
  },
  {
    discriminatorKey: DKey,
  }
)

const DiscussionSchema = new Schema()

const EventSchema = new Schema({
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
})

const JobSchema = new Schema({
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
})

const NoticeSchema = new Schema({
  deadline: {
    type: Date,
    required: true
  }
})

PostSchema.virtual('relevance').get(async function () {
  console.log(this.downvotes)
  return this.upvotes.length //- this.downvotes.length
})

const Post = model('Post', PostSchema)

const Discussion = Post.discriminator(enumPostType.Discussion, DiscussionSchema)
const Notice = Post.discriminator(enumPostType.Notice, NoticeSchema)
const Event = Post.discriminator(enumPostType.Event, EventSchema)
const Job = Post.discriminator(enumPostType.Job, JobSchema)

const PostDTC = composeWithMongooseDiscriminators(Post)
  .setField('imageUrl', {
    type: UrlTC
  })
  .addFields({
    relevance: {
      type: 'Int'
    }
  })

const DiscussionTC = PostDTC.discriminator(Discussion)
const NoticeTC = PostDTC.discriminator(Notice)
const EventTC = PostDTC.discriminator(Event)
const JobTC = PostDTC.discriminator(Job)

PostDTC.getDInterface()
  .addTypeResolver(
    DiscussionTC,
    value => value.kind === enumPostType.Discussion
  )
  .addTypeResolver(EventTC, value => value.kind === enumPostType.Event)
  .addTypeResolver(JobTC, value => value.kind === enumPostType.Job)
  .addTypeResolver(NoticeTC, value => value.kind === enumPostType.Notice)

PostDTC.getResolver('connection').addSortArg({
  name: 'RELEVANCE_ASC',
  description: 'Sort by increasing upvotes',
  value: (resolveParams) => {
    return {
      relevance: -1
    }
  }
})

PostDTC.getResolver('createOne')
  .getArgITC('record')
  .merge(toInputObjectType(DiscussionTC).removeField('kind'))
  .merge(
    toInputObjectType(EventTC)
      .removeField('kind')
      .makeOptional(['start', 'end', 'place'])
  )
  .merge(
    toInputObjectType(JobTC)
      .removeField('kind')
      .makeOptional(['start', 'end', 'place', 'isPaid', 'isClosed'])
  )
  .merge(
    toInputObjectType(NoticeTC)
      .removeField('kind')
      .makeOptional(['deadline'])
  )

PostDTC.getResolver('updateById')
  .getArgITC('record')
  .merge(
    toInputObjectType(DiscussionTC)
      .removeField('kind')
      .makeOptional(DiscussionTC.getFieldNames())
  )
  .merge(
    toInputObjectType(EventTC)
      .removeField('kind')
      .makeOptional(EventTC.getFieldNames())
  )
  .merge(
    toInputObjectType(JobTC)
      .removeField('kind')
      .makeOptional(JobTC.getFieldNames())
  )
  .merge(
    toInputObjectType(NoticeTC)
      .removeField('kind')
      .makeOptional(NoticeTC.getFieldNames())
  )
  .makeRequired('_id')

PostDTC.addResolver({
  name: 'findManyByCreator',

  args: {
    creator: `String`
  },

  type: [PostDTC.getDInterface()],

  resolve: ({ args }) =>
    Post.find({ creator: args.creator })
      .then(res => res)
      .catch(err => {
        log.error(err)
        return new ApolloError(`Post findManyByCreator failed: ${err}`)
      })
}).wrapResolverResolve('connection', next => rp => {
  rp.projection.kind = {}

  return next(rp)
})

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
  JobTC
}
