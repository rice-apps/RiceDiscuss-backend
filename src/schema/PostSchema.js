import { ForbiddenError, UserInputError } from 'apollo-server-express'
import S3 from 'aws-sdk/clients/s3'
import log from 'loglevel'
import { CommentTC, PostDTC, UserTC, Post } from '../models'
import {
  checkLoggedIn,
  userCheckPost,
  userCheckCreate,
  checkHTML,
  pubsub
} from '../utils'

import { S3PayloadTC } from '../models/CustomTypes'

import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET,
  BUCKET,
  REGION,
  MAX_REPORTS
} from '../config'

PostDTC.addFields({
  comments: [CommentTC]
})
  .addRelation('comments', {
    resolver: () => CommentTC.getResolver('findTopLevelByPostID'),

    prepareArgs: {
      postID: source => source._id
    },

    projection: {
      _id: 1
    }
  })
  .addRelation('creator', {
    resolver: () => UserTC.getResolver('findOne'),

    prepareArgs: {
      filter: source => {
        return {
          netID: source.creator
        }
      }
    },

    projection: {
      creator: 1
    }
  })
  .addRelation('upvotes', {
    resolver: () => UserTC.getResolver('findMany'),

    prepareArgs: {
      filter: source => {
        return {
          _operators: {
            netID: {
              in: source.upvotes
            }
          }
        }
      }
    },

    projection: {
      upvotes: 1
    }
  })
  .addRelation('downvotes', {
    resolver: () => UserTC.getResolver('findMany'),

    prepareArgs: {
      filter: source => {
        return {
          _operators: {
            netID: {
              in: source.downvotes
            }
          }
        }
      }
    },

    projection: {
      downvotes: 1
    }
  })
  .addRelation('reports', {
    resolver: () => UserTC.getResolver('findMany'),

    prepareArgs: {
      filter: source => {
        return {
          _operators: {
            netID: {
              in: source.reports
            }
          }
        }
      }
    },

    projection: {
      reports: 1
    }
  })
  .addResolver({
    name: 'upvotePost',
    type: PostDTC.getDInterface(),
    args: { _id: 'ID!', netID: 'String!' },
    resolve: async ({ args, context }) => {
      if (args.netID !== context.netID) {
        return new ForbiddenError('Cannot upvote post as someone else')
      }

      const post = await Post.findById(args._id)
        .then(res => {
          return res
        })
        .catch(err => {
          log.error(err)
          return null
        })

      if (post === null) {
        return new UserInputError('Trying to upvote nonexistent post')
      }

      if (post.upvotes.includes(args.netID)) {
        post.upvotes = post.upvotes.filter(upvoter => upvoter !== args.netID)
      } else if (post.downvotes.includes(args.netID)) {
        post.downvotes = post.downvotes.filter(
          downvoter => downvoter !== args.netID
        )
        post.upvotes.push(args.netID)
      } else {
        post.upvotes.push(args.netID)
      }

      await post.save().catch(err => log.error(err))

      return post
    }
  })
  .addResolver({
    name: 'downvotePost',
    type: PostDTC.getDInterface(),
    args: { _id: 'ID!', netID: 'String!' },
    resolve: async ({ args, context }) => {
      if (args.netID !== context.netID) {
        return new ForbiddenError('Cannot downvote post as someone else')
      }

      const post = await Post.findById(args._id)
        .then(res => {
          return res
        })
        .catch(err => {
          log.error(err)
          return null
        })

      if (post === null) {
        return new UserInputError('Trying to downvote nonexistent post')
      }

      if (post.downvotes.includes(args.netID)) {
        post.downvotes = post.downvotes.filter(
          downvoter => downvoter !== args.netID
        )
      } else if (post.upvotes.includes(args.netID)) {
        post.upvotes = post.upvotes.filter(upvoter => upvoter !== args.netID)
        post.downvotes.push(args.netID)
      } else {
        post.downvotes.push(args.netID)
      }

      await post.save().catch(err => log.error(err))

      return post
    }
  })
  .addResolver({
    name: 'toggleReport',
    type: PostDTC.getDInterface(),
    args: { _id: 'ID!', netID: 'String!' },
    resolve: async ({ args, context }) => {
      if (args.netID !== context.netID) {
        return new ForbiddenError('Cannot report post as someone else')
      }

      const post = await Post.findById(args._id)
        .then(res => {
          return res
        })
        .catch(err => {
          log.error(err)
          return null
        })

      if (post === null) {
        return new UserInputError('Trying to report nonexistent post')
      }

      if (post.reports.includes(args.netID)) {
        post.reports = post.reports.filter(reporter => reporter !== args.netID)
      } else {
        post.reports.push(args.netID)
      }

      await post.save().catch(err => log.error(err))

      return post
    }
  })
  .addResolver({
    name: 'signS3Url',
    type: () => S3PayloadTC,
    args: {
      filename: `String!`,
      filetype: `String!`
    },
    resolve: async ({ args }) => {
      const s3 = new S3({
        apiVersion: '2006-03-01',
        region: REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET
        }
      })

      const s3Params = {
        Bucket: BUCKET,
        Key: args.filename,
        Expires: 60,
        ContentType: args.filetype,
        ACL: 'public-read'
      }

      const signedRequest = s3.getSignedUrl('putObject', s3Params)
      const url = `https://${BUCKET}.s3.amazonaws.com/${args.filename}`

      return {
        signedRequest,
        url
      }
    }
  })
  .addResolver({
    name: 'getAllTags',
    type: '[String]',
    resolve: async () => {
      const allTags = await Post.find({})
        .select('tags')
        .exec()
        .then(mongoDocs => mongoDocs.map(post => post.tags).flat())
        .catch(err => {
          log.error(err)
          return true
        })

      return Array.from(new Set(allTags))
    }
  })
  .addResolver({
    name: 'getFilteredData',
    type: PostDTC.getDInterface().getTypePlural(),
    args: {
      filterStyle: 'String!',

      beginDate: "Date",
      endDate: "Date",
      tags: "[String]",
      upvoteType: "String",
      kind: "EnumDKeyPostKind"
    },
    resolve: async ({ args }) => {
      let all_posts = await Post.find({})
        .exec()
        .then(post => post)
        .catch(err => {
          log.error(err)
          return true
        })

      const compare_upvote_lengths = (a, b) => {
        return a.upvotes.length - a.downvotes.length 
              <= b.upvotes.length - b.downvotes.length ? -1 : 1
      }

      if (args.filterStyle.includes("date")){
        all_posts = all_posts.filter(post => {
          const creation_date = post.date_created
          return beginDate < creation_date && creation_date < endDate
        })
      }
      if (args.filterStyle.includes("popularity")){
        if (args.upvoteType.includes('hot')) {
          all_posts = all_posts.sort(compare_upvote_lengths).reverse()
        } else if (args.upvoteType.includes('cold')) {
          all_posts = all_posts.sort(compare_upvote_lengths)
        }
      }
      if (args.filterStyle.includes("kind")){
        all_posts = all_posts.filter(post => args.kind === post.kind)
      }
      if (args.filterStyle.includes("tags")){
        all_posts = all_posts.filter(post => {
          const post_tags = post.tags
          for (let i = 0; i < args.tags.length; i++) {
            if (post_tags.includes(args.tags[i])) return true
          }
          return false
        })
      }

      return all_posts
    }
  })

const PostQuery = {
  postById: PostDTC.getResolver('findById')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next({
        ...rp,
        projection: { reports: {}, ...rp.projection }
      })

      if (payload.reports.length > MAX_REPORTS) {
        if (payload.body) {
          payload.body = '[This post has been removed.]'
        }

        if (payload.title) {
          payload.title = '[This post has been removed.]'
        }
      }

      return payload
    }),

  postOne: PostDTC.getResolver('findOne')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next({
        ...rp,
        projection: { reports: {}, ...rp.projection }
      })

      if (payload.record.reports.length > MAX_REPORTS) {
        if (payload.record.body) {
          payload.record.body = '[This post has been removed.]'
        }

        if (payload.record.title) {
          payload.record.title = '[This post has been removed.]'
        }
      }

      return payload
    }),

  postCount: PostDTC.getResolver('count').withMiddlewares([checkLoggedIn]),

  postConnection: PostDTC.getResolver('connection').addArgs()
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next({
        ...rp,
        projection: { reports: {}, ...rp.projection }
      })

      for (let i = 0; i < payload.edges.length; i += 1) {
        if (payload.edges[i].node.reports.length > MAX_REPORTS) {
          if (payload.edges[i].node.title) {
            payload.edges[i].node.title = '[This post has been removed.]'
          }

          if (payload.edges[i].node.body) {
            payload.edges[i].node.body = '[This post has been removed.]'
          }
        }
      }

      //maybe do filtering here?
      return payload
    }),

  getAllTags: PostDTC.getResolver('getAllTags').withMiddlewares([checkLoggedIn]),
  getFilteredData: PostDTC.getResolver('getFilteredData').withMiddlewares([checkLoggedIn])
}

const PostMutation = {
  postCreateOne: PostDTC.getResolver('createOne')
    .withMiddlewares([checkLoggedIn, userCheckCreate, checkHTML])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('postCreated', {
        postCreated: payload.record
      })

      return payload
    }),

  postUpdateById: PostDTC.getResolver('updateById')
    .withMiddlewares([checkLoggedIn, userCheckPost, checkHTML])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('postUpdated', {
        postUpdated: payload.record
      })

      return payload
    }),

  upvotePostById: PostDTC.getResolver('upvotePost')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      await pubsub.publish('postVoteChanged', {
        postVoteChanged: payload
      })

      return payload
    }),

  downvotePostById: PostDTC.getResolver('downvotePost')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('postVoteChanged', {
        postVoteChanged: payload
      })

      return payload
    }),

  togglePostReport: PostDTC.getResolver('toggleReport')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      if (rp.args.reports) {
        if (rp.args.reports.length > MAX_REPORTS) {
          rp.args.body = '[This post has been removed.]'
          rp.args.title = '[This post has been removed.]'
        }
      }

      const payload = await next(rp)

      pubsub.publish('postReported', {
        postReported: payload
      })

      return payload
    }),

  postRemoveById: PostDTC.getResolver('removeById')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('postRemoved', {
        postRemoved: payload.record
      })

      return payload
    }),

  signS3Url: PostDTC.getResolver('signS3Url').withMiddlewares([checkLoggedIn])
}

const PostSubscription = {
  postCreated: {
    type: PostDTC.getDInterface(),

    subscribe: () => pubsub.asyncIterator('postCreated')
  },

  postUpdated: {
    type: PostDTC.getDInterface(),

    subscribe: () => pubsub.asyncIterator('postUpdated')
  },

  postVoteChanged: {
    type: PostDTC.getDInterface(),

    subscribe: () => pubsub.asyncIterator('postVoteChanged')
  },

  postReported: {
    type: PostDTC.getDInterface(),

    subscribe: () => pubsub.asyncIterator('postReported')
  },

  postRemoved: {
    type: PostDTC.getDInterface(),

    subscribe: () => pubsub.asyncIterator('postRemoved')
  }
}

export { PostQuery, PostMutation, PostSubscription }
