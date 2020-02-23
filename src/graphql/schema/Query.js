const { ApolloServer, gql } = require('apollo-server');
import Post from './Post.js';
import User from './User.js';
import Comment from './Comment.js';


const QueryGQLSchema = gql`
    type Query {
        posts: [Post]
        post(id: ID): Post
        users: [User]
        user(id: ID): User
        comments: [Comment]
        comment(id: ID): Comment
    }
`;

export default QueryGQLSchema;
