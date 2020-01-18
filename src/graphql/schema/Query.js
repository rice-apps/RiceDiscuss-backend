const { ApolloServer, gql } = require('apollo-server');


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
