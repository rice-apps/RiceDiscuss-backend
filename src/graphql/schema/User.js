import { gql } from 'apollo-server-express';

export const typedef = gql`
    type User {
        _id: ID!,
        username: String!,
        netID: String!,
        password: String!,
        date_joined: Date!,
    }
`;