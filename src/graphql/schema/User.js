const { ApolloServer, gql } = require('apollo-server');

const UserGQLSchema = gql`
    type User {
        _id: ID!,
        netID: String!,
        token: String!,
        date_joined: Date!
    }
`;

export default UserGQLSchema;
