import gql from 'apollo-server-express';

const CommentGQLSchema = gql`
    type Comment {
        _id: ID!,
        creator: User!,
        post_id: Post!,
        parent_id: Comment,
        date_created: Date!,
        body: String!,
        upvotes: [ID],
        downvotes: [ID],
        children: [Comment!],
        depth: Int!
    }
`;

export default CommentGQLSchema;
