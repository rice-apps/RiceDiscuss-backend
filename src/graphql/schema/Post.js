const { ApolloServer, gql } = require('apollo-server');


const PostGQLSchema = gql`
    type Post {
        _id: ID!,
        creator: String!,
        title: String!,
        body: String!,
        date_created: String!,
        upvotes: [User],
        downvotes: [User],
        tags: [String!],
        postType: String!,
        start: String,
        end: String,
        place: String
    }
`;
export default PostGQLSchema;
