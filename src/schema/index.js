import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolver';

const typeDefs = `
    type Query {
        me: User
    }

    type User {
        username: String!
    }
`;

let base_schema = {typeDefs, resolvers};

export default base_schema
