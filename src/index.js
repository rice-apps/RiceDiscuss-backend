import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import schema from './schema';

const app = express();
const server = new ApolloServer(schema);

server.applyMiddleware({ app, path: '/graphql' });

app.use(cors());

app.listen({ port: 8000 }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql")
});
