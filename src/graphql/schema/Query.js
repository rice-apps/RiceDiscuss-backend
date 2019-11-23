import gql from 'apollo-server-express';

const QueryGQLSchema = gql`
    type Query {
        post(_id: ID): Post
        user(_id: ID): User
        comment(_id: ID): Comment
    }
`;

export default QueryGQLSchema;
