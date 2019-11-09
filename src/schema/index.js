import {ApolloServer, gql} from 'apollo-server-express';
const resolvers = require('./resolvers');

const typeDefs = gql`
type Place {
    id: String!
    listing_url: String!
    name: String!
}

type Query {
    places: [Place!]!
}


type User {
    id: ID!
    username: String!
}
`;
const schema = new ApolloServer({
	typeDefs,
	resolvers,
	playground: {
		endpoint: '/graphql',
	}
});
export default schema;
