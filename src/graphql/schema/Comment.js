const { ApolloServer, gql } = require('apollo-server');

const CommentGQLSchema = gql`
    type Comment {
        _id: ID!,
        creator: Post!,
        post_id: Post!,
        parent_id: Comment,
        date_created: Date!,
        body: String!,
        upvotes: [User],
        downvotes: [User],
        children: [Comment!],
        depth: Int!
    }
`;

export default CommentGQLSchema;
