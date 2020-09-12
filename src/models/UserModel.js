import { ApolloError } from 'apollo-server-express'
import { composeWithMongoose } from 'graphql-compose-mongoose'
import log from 'loglevel'
import { Schema, model } from 'mongoose'
import { COLLEGES, MAJORS, MINORS } from '../config'

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  netID: {
    type: String,
    required: true,
    unique: true
  },

  token: {
    type: String,
    required: false,
    unique: true
  },

  date_joined: {
    type: Date,
    required: false,
    default: new Date().getTime(),
    index: true
  },

  college: {
    type: String,
    required: false
  },

  major: {
    type: [String],
    validate: {
      validator (majors) {
        return majors.every(major => MAJORS.includes(major))
      },
      message: props => `${props.value} has a major that's not valid!`
    },
    required: false
  },

  minor: {
    type: [String],
    validate: {
      validator (minors) {
        return minors.every(minor => MINORS.includes(minor))
      },
      message: props => `${props.value} has a minor that's not valid!`
    },
    required: false
  },

  isNewUser: {
    type: Boolean,
    default: true
  },

  savedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'PostInterface'
    }
  ],

  email: {
    type: String,
    required: false
  },

  phone: {
    type: String,
    required: false
  },

  imageUrl: {
    type: String,
    required: false
  }
})

const User = model('User', UserSchema)

const UserTC = composeWithMongoose(User)

UserTC.wrapResolverResolve('findOne', next => rp =>
  next({ ...rp, projection: { netID: {}, ...rp.projection } })
    .then(payload => {
      const res = { ...payload._doc }

      if (typeof res.netID === 'undefined' || res.netID !== rp.context.netID) {
        res.token = null
      }

      return res
    })
    .catch(err => {
      log.error(err)
      return new ApolloError(`User findOne failed: ${err}`)
    })
).wrapResolverResolve('connection', next => rp =>
  next({ ...rp, projection: { netID: {}, ...rp.projection } })
    .then(payload => {
      const res = { ...payload }

      for (let i = 0; i < res.edges.length; i += 1) {
        if (
          typeof res.edges[i].node.netID === 'undefined' ||
          res.edges[i].node.netID !== rp.context.netID
        ) {
          res.edges[i].node.token = null
        }
      }

      return res
    })
    .catch(err => {
      log.error(err)
      return new ApolloError(`User connection resolver failed: ${err}`)
    })
)

export { User, UserTC }
