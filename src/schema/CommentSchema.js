import {
  ForbiddenError,
  UserInputError,
  withFilter
} from 'apollo-server-express'
import log from 'loglevel'
import { Comment, CommentTC, PostDTC, UserTC } from '../models'
import {
  checkLoggedIn,
  userCheckComment,
  userCheckCreate,
  pubsub
} from '../utils'

import { MAX_REPORTS } from '../config'

CommentTC.addFields({
  children: [CommentTC]
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
  .addRelation('post', {
    resolver: () => PostDTC.getResolver('findById'),

    prepareArgs: {
      _id: source => source.post
    },

    projection: {
      post: 1
    }
  })
  .addRelation('parent', {
    resolver: () => CommentTC.getResolver('findById'),

    prepareArgs: {
      _id: source => source.parent
    },

    projection: {
      parent: 1
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
  .addRelation('children', {
    resolver: () => CommentTC.getResolver('findManyByParentID'),

    prepareArgs: {
      parent: source => source._id
    },

    projection: {
      _id: 1
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
    name: 'upvoteComment',
    type: CommentTC,
    args: { _id: `ID`, netID: `String!` },
    resolve: async ({ args, context }) => {
      if (args.netID !== context.netID) {
        return new ForbiddenError('Cannot upvote comment as someone else')
      }

      const comment = await Comment.findById(args._id)
        .then(res => {
          return res
        })
        .catch(err => {
          log.error(err)
          return null
        })

      if (comment == null) {
        return new UserInputError('Trying to upvote nonexistent comment')
      }

      if (comment.upvotes.includes(args.netID)) {
        comment.upvotes = comment.upvotes.filter(
          upvoter => upvoter !== args.netID
        )
      } else if (comment.downvotes.includes(args.netID)) {
        comment.downvotes = comment.downvotes.filter(
          downvoter => downvoter !== args.netID
        )
        comment.upvotes.push(args.netID)
      } else {
        comment.upvotes.push(args.netID)
      }

      await comment.save().catch(err => log.error(err))

      return comment
    }
  })
  .addResolver({
    name: 'downvoteComment',
    type: CommentTC,
    args: { _id: 'ID!', netID: 'String!' },
    resolve: async ({ args, context }) => {
      if (args.netID !== context.netID) {
        return new ForbiddenError('Cannot downvote comment as someone else')
      }

      const comment = await Comment.findById(args._id)
        .then(res => {
          return res
        })
        .catch(err => {
          log.error(err)
          return null
        })

      if (comment == null) {
        return new UserInputError('Trying to downvote nonexistent comment')
      }

      if (comment.downvotes.includes(args.netID)) {
        comment.downvotes = comment.downvotes.filter(
          downvoter => downvoter !== args.netID
        )
      } else if (comment.upvotes.includes(args.netID)) {
        comment.upvotes = comment.upvotes.filter(
          upvoter => upvoter !== args.netID
        )
        comment.downvotes.push(args.netID)
      } else {
        comment.downvotes.push(args.netID)
      }

      await comment.save().catch(err => log.error(err))

      return comment
    }
  })
  .addResolver({
    name: 'toggleReport',
    type: CommentTC,
    args: { _id: 'ID!', netID: 'String!' },
    resolve: async ({ args, context }) => {
      if (args.netID !== context.netID) {
        return new ForbiddenError('Cannot report comment as someone else')
      }

      const comment = await Comment.findById(args._id)
        .then(res => {
          return res
        })
        .catch(err => {
          log.error(err)
          return null
        })

      if (comment === null) {
        return new UserInputError('trying to report nonexistent comment')
      }

      if (comment.reports.includes(args.netID)) {
        comment.reports = comment.reports.filter(
          reporter => reporter !== args.netID
        )
      } else {
        comment.reports.push(args.netID)
      }

      await comment.save().catch(err => log.error(err))

      return comment
    }
  })

const CommentQuery = {
  commentById: CommentTC.getResolver('findById')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next({
        ...rp,
        projection: { reports: {}, ...rp.projection }
      })

      if (payload.record.reports.length > MAX_REPORTS) {
        payload.record.body = '[This comment has been removed]'
      }

      return payload
    }),

  commentByParent: CommentTC.getResolver('findManyByParentID')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next({
        ...rp,
        projection: { reports: {}, ...rp.projection }
      })

      for (let i = 0; i < payload.length; i += 1) {
        if (payload[i].reports.length > MAX_REPORTS) {
          if (payload[i].body) {
            payload[i].body = '[This comment has been removed]'
          }
        }
      }

      return payload
    }),

  commentByPost: CommentTC.getResolver('findTopLevelByPostID')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next({
        ...rp,
        projection: { reports: {}, ...rp.projection }
      })

      for (let i = 0; i < payload.length; i += 1) {
        if (payload[i].reports.length > MAX_REPORTS) {
          if (payload[i].body) {
            payload[i].body = '[This comment has been removed]'
          }
        }
      }

      return payload
    }),

  commentCount: CommentTC.getResolver('count').withMiddlewares([checkLoggedIn]),

  commentConnection: CommentTC.getResolver('connection')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next({
        ...rp,
        projection: { reports: {}, ...rp.projection }
      })

      for (let i = 0; i < payload.edges.length; i += 1) {
        if (payload.edges[i].node.reports.length > MAX_REPORTS) {
          if (payload.edges[i].node.body) {
            payload.edges[i].node.body = '[This comment has been removed]'
          }
        }
      }

      return payload
    })
}

const CommentMutation = {
  commentCreateOne: CommentTC.getResolver('createOne')
    .withMiddlewares([checkLoggedIn, userCheckCreate])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('commentCreated', {
        commentCreated: payload.record
      })

      return payload
    }),

  commentUpdateById: CommentTC.getResolver('updateById')
    .withMiddlewares([checkLoggedIn, userCheckComment])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('commentUpdated', {
        commentCreated: payload.record
      })

      return payload
    }),

  upvoteCommentById: CommentTC.getResolver('upvoteComment')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('commentVoteChanged', {
        commentVoteChanged: payload
      })

      return payload
    }),

  downvoteCommentById: CommentTC.getResolver('downvoteComment')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('commentVoteChanged', {
        commentVoteChanged: payload
      })

      return payload
    }),

  toggleCommentReport: CommentTC.getResolver('toggleReport')
    .withMiddlewares([checkLoggedIn])
    .wrapResolve(next => async rp => {
      if (rp.args.record.reports) {
        if (rp.args.record.reports.length > MAX_REPORTS) {
          rp.args.record.body = '[This comment has been removed]'
        }
      }

      const payload = await next(rp)

      pubsub.publish('commentReported', {
        commentReported: payload
      })

      return payload
    }),

  commentRemoveById: CommentTC.getResolver('removeById')
    .withMiddlewares([checkLoggedIn, userCheckComment])
    .wrapResolve(next => async rp => {
      const payload = await next(rp)

      pubsub.publish('commentRemoved', {
        commentRemoved: payload.record
      })

      return payload
    })
}

const CommentSubscription = {
  commentCreated: {
    type: CommentTC,

    args: {
      postID: 'ID!'
    },

    subscribe: withFilter(
      (rootValue, args, context, info) =>
        pubsub.asyncIterator('commentCreated'),
      (payload, variables) =>
        String(payload.commentCreated.post) === String(variables.postID)
    )
  },

  commentUpdated: {
    type: CommentTC,

    args: {
      postID: 'ID!'
    },

    subscribe: withFilter(
      (rootValue, args, context, info) =>
        pubsub.asyncIterator('commentUpdated'),
      (payload, variables) =>
        String(payload.commentUpdated.post) === String(variables.postID)
    )
  },

  commentVoteChanged: {
    type: CommentTC,

    args: {
      postID: 'ID!'
    },

    subscribe: withFilter(
      (rootValue, args, context, info) =>
        pubsub.asyncIterator('commentVoteChanged'),
      (payload, variables) =>
        String(payload.commentVoteChanged.post) === String(variables.postID)
    )
  },

  commentReported: {
    type: CommentTC,

    args: {
      postID: 'ID!'
    },

    subscribe: withFilter(
      (rootValue, args, context, info) =>
        pubsub.asyncIterator('commentReported'),
      (payload, variables) =>
        String(payload.commentReported.post) === String(variables.postID)
    )
  },

  commentRemoved: {
    type: CommentTC,

    args: {
      postID: 'ID!'
    },

    subscribe: withFilter(
      (rootValue, args, context, info) =>
        pubsub.asyncIterator('commentRemoved'),
      (payload, variables) =>
        String(payload.commentRemoved.post) === String(variables.postID)
    )
  }
}

export { CommentQuery, CommentMutation, CommentSubscription }
