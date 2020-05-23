import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http';

import Schema from './schema';
import oAuth from './controllers/auth-controller';

import './db';

import { DEV_PORT } from './config';

const server = new ApolloServer({
    schema: Schema,
    subscriptions: {
        onConnect: (connectionParams, webSocket, context) => {
            console.log("WebSocket connected!");
        },

        onDisconnect: (webSocket, context) => {
            console.log("WebSocket disconnected!");
        },
    },
    context: {
        
    }
});

const app = express();

server.applyMiddleware({ app });
app.use('/login', oAuth);

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: DEV_PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${DEV_PORT}${server.graphqlPath}!`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${DEV_PORT}${server.subscriptionsPath}!`);
});
