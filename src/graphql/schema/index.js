import { makeExecutableSchema } from 'apollo-server-express';

import QueryGQLSchema from './Query.js';
import UserGQLSchema from './User.js';
import PostGQLSchema from './Post.js';
import CommentGQLSchema from './Comment.js'

const resolvers = require('../resolvers/resolvers');

const schema = new makeExecutableSchema({
	typeDefs: [QueryGQLSchema, UserGQLSchema, PostGQLSchema, CommentGQLSchema],
	resolvers: resolvers,
});

export default schema;
