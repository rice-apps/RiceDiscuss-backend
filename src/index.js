import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http';
import Schema from './schema';
import oAuth from './controllers/auth-controller';
import './db';

const PORT = 3000;

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

httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}!`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}!`);
});
