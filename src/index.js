import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http';

import Schema from './schema';

const PORT = 3000;

const server = new ApolloServer({
    schema: Schema
});

const app = express();
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`);
});
