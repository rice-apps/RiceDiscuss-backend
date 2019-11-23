import gql from 'apollo-server-express';

const PostGQLSchema = gql`
    type Post {
        _id: ID!,
        creator: User!,
        title: String!,
        body: String!,
        date_created: String!,
        upvotes: [ID],
        downvotes: [ID],
        tags: [String!],
        
    }
`;

export default PostGQLSchema;
