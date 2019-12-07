import QueryGQLSchema from './Query.js';
import UserGQLSchema from './User.js';
import PostGQLSchema from './Post.js';
import CommentGQLSchema from './Comment.js';

import Mutation from './Mutation.js';

import { merge } from 'lodash';

const typeDefs = merge(QueryGQLSchema, [UserGQLSchema, PostGQLSchema, CommentGQLSchema, Mutation]);

export default typeDefs;
