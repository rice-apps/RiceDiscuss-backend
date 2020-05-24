import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import Schema from './schema';
import oAuth from './controllers/auth-controller';

import './db';

import {
    CLIENT_TOKEN_SECRET,
    DEV_PORT
} from './config';

const server = new ApolloServer({
    schema: Schema,
    context: ({ req, res }) => {
        /*
            TODO: check where the token is actually sent
        */

        if (req != null) {
            const token = req.token | '';
            let decoded = null;

            try {
                decoded = jwt.verify(token, CLIENT_TOKEN_SECRET);
            } catch {
                console.log("authentication failed!");
                // return res.status(403);
            }

            return {
                netID: decoded.data.user,
            };
        }

    },
    subscriptions: {
        onConnect: (connectionParams, webSocket, context) => {
            let decoded = null;
            /*
                TODO: check where the WebSocket token is actually sent
            */
            try {
                decoded = jwt.verify(connectionParams.authToken, CLIENT_TOKEN_SECRET);
            } catch {
                console.log("Invalid token");
            }

            if (decoded != null && decoded.data.user === context.netID) {
                console.log("WebSocket request matches logged in user!");
            }

            console.log("WebSocket connected!");
        },

        onDisconnect: (webSocket, context) => {
            console.log("WebSocket disconnected!");
        },
    },
});

const app = express();

server.applyMiddleware({ app });

// cors({ origin: "https://idp.rice.edu/" })

app.use('/login', oAuth);

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: DEV_PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${DEV_PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${DEV_PORT}${server.subscriptionsPath}`);
});
