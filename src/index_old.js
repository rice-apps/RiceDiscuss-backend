import express from 'express';
import cors from 'cors';
import { ApolloServer, gql } from 'apollo-server-express';
import { MongoClient as client } from 'mongodb';
import assert from 'assert';

const app = express();

const uri = "mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/admin?retryWrites=true&w=majority";



const schema = gql`
    type Query {
        me: User
    }

    type User {
        username: String!
    }
`;

const resolvers = {
    Query: {
        me: () => {
            return {
                username: 'Victor Song',
            };
        },
    },
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

app.use(cors());

app.listen({ port: 8000 }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql")
});
