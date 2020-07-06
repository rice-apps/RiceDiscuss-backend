import express from "express";
import { ApolloServer } from "apollo-server-express";
import http from "http";
import jwt from "jsonwebtoken";
import cors from "cors";

import Schema from "./schema";

import "./utils/db";

import { CLIENT_TOKEN_SECRET, DEV_PORT, ALLOWED_ORIGINS } from "./config";

const server = new ApolloServer({
    schema: Schema,
    introspection: true,
    playground: true,
    context: ({ req }) => {
        if (req) {
            try {
                const decoded = jwt.verify(
                    req.headers.authorization,
                    CLIENT_TOKEN_SECRET,
                );

                return {
                    netID: decoded.netID,
                };
            } catch (err) {
                return {
                    netID: null,
                };
            }
        }
    },
    subscriptions: {
        onConnect: (connectionParams, websocket, context) => {
            if (connectionParams.authToken) {
                try {
                    const decoded = jwt.verify(
                        connectionParams.authToken,
                        CLIENT_TOKEN_SECRET,
                    );

                    console.log(
                        `WebSocket connected from ${context.request.headers.origin} using ${websocket.protocol}`,
                    );

                    return {
                        netID: decoded.netID,
                    };
                } catch (err) {
                    websocket.close();
                    throw new Error(
                        `WebSocket authentication failed due to ${err}`,
                    );
                }
            }
        },

        onDisconnect: (websocket, context) => {
            console.log(
                `WebSocket disconnected from ${context.request.headers.origin} using ${websocket.protocol}`,
            );
        },
    },
});

const app = express();

server.applyMiddleware({ app });

app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
    }),
);

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: DEV_PORT }, () => {
    console.log(
        `🚀 Server ready at http://localhost:${DEV_PORT}${server.graphqlPath}`,
    );
    console.log(
        `🚀 Subscriptions ready at ws://localhost:${DEV_PORT}${server.subscriptionsPath}`,
    );
});
