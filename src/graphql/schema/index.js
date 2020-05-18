import QueryGQLSchema from './Query.js';
import UserGQLSchema from './User.js';
import PostGQLSchema from './Post.js';
import CommentGQLSchema from './Comment.js';

import Mutation from './Mutation.js';

const { gql } = require('apollo-server-express');
import { merge } from 'lodash';

// const typeDefs = merge([UserGQLSchema, PostGQLSchema, CommentGQLSchema, Mutation], QueryGQLSchema);
const typeDefs = gql`
    type Post {
        id: ID!,
        creator: String!,
        title: String!,
        body: String!,
        date_created: String!,
        upvotes: [String],
        downvotes: [String],
        tags: [String!],
        postType: String!,
        start: String,
        end: String,
        place: String,
    }

    type User {
        id: ID!,
        netID: String!,
        username: String!,
        date_joined: String!
    }

    type Comment {
        id: ID!,
        creator: String!,
        post_id: ID,
        parent_id: ID,
        date_created: String!,
        body: String!,
        upvotes: [User],
        downvotes: [User],
        children: [Comment!],
        depth: Int!
    }

    type Mutation {
        updatePost(id: ID, body: String, title: String): Post
        createPost(body: String, title: String, postType: String, userID: String): Post
        deletePost(id: ID): Post
        upvotePost(id: ID, username: String): Post
        downvotePost(id: ID, username: String): Post
        
        createComment(body: String, post_id: String, parent_id: String, username: String): Comment
        upvoteComment(id: ID, username: String): Post
        downvoteComment(id: ID, username: String): Post
        updateComment(id: ID, body: String): Comment
        deleteComment(id: ID): Comment
    }


    type Query {
        posts: [Post]
        postByID(id: ID): Post
        postByUser(userID: String): [Post]
        users: [User]
        user(id: ID): User
        userByNetID(netID: String): [User]
        comments: [Comment]
        comment(id: ID): Comment
    }

`

export default typeDefs;
