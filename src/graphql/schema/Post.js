const { ApolloServer, gql } = require('apollo-server');


const PostGQLSchema = gql`
    type Post {
        _id: ID!,
        creator: String!,
        title: String!,
        body: String!,
        date_created: String!,
        upvotes: [String],
        downvotes: [String],
        tags: [String!],
        
    }
`;

export default PostGQLSchema;
