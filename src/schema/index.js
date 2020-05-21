import { SchemaComposer } from 'graphql-compose';

import { CommentQuery, CommentMutation } from './CommentSchema';
import { PostQuery, PostMutation } from './PostSchema';
import { UserQuery, UserMutation } from './UserSchema';

const sc = new SchemaComposer();

sc.Query.addFields({
    ...CommentQuery,
    ...PostQuery,
    ...UserQuery,
});

sc.Mutation.addFields({
    ...CommentMutation,
    ...PostMutation,
    ...UserMutation,
});

const Schema = sc.buildSchema();

export default Schema;
