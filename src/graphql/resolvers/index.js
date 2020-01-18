import QueryResolver from './Query.js';
import PostResolver from './Post.js';
import UserResolver from './User.js';
import CommentResolver from './Comment.js';
import MutationResolver from './Mutation.js';

import { merge } from 'lodash';

const resolvers = merge([PostResolver.Post, UserResolver.User, CommentResolver.Comment, MutationResolver.Mutation], QueryResolver.Query);

export default resolvers;
