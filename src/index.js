import express from "express";
import { ApolloServer } from "apollo-server-express";
import http from "http";
import jwt from "jsonwebtoken";
import cors from "cors";

import Schema from "./schema";
import oAuth from "./controllers/auth-controller";

import "./db";

import { CLIENT_TOKEN_SECRET, DEV_PORT, ALLOWED_ORIGINS } from "./config";

const server = new ApolloServer({
    schema: Schema,
    context: ({ req }) => {
        if (req) {
            try {
                const decoded = jwt.verify(
                    req.headers.authorization,
                    CLIENT_TOKEN_SECRET,
                );

                return {
                    netID: decoded.data.user,
                };
            } catch (err) {
                throw new Error("User authentication failed");
            }
        }
    },
    subscriptions: {
        onConnect: (connectionParams, _websocket, _context) => {
            if (connectionParams.authToken) {
                try {
                    const decoded = jwt.verify(
                        connectionParams.authToken,
                        CLIENT_TOKEN_SECRET,
                    );

                    console.log("Websocket connected");

                    return {
                        user: decoded.user,
                    };
                } catch (err) {
                    throw new Error("WebSocket authentication failed");
                }
            }
        },

        onDisconnect: (_websocket, _context) => {
            console.log("WebSocket disconnected");
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

app.use("/login", express.json(), oAuth);

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
