import gql from 'apollo-server-express';

const UserGQLSchema = gql`
    type User {
        _id: ID!,
        netID: String!,
        token: String!,
        date_joined: Date!
    }
`;

export default UserGQLSchema;
