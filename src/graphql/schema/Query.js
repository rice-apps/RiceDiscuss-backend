import gql from 'apollo-server-express';

const QueryGQLSchema = gql`
    type Query {
        posts: [Post]
        post(_id: ID): Post
        users: [User]
        user(_id: ID): User
        comments: [Comment]
        comment(_id: ID): Comment
    }
`;

export default QueryGQLSchema;
