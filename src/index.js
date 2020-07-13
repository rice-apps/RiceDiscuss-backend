import express from "express";
import { ApolloServer } from "apollo-server-express";
import http from "http";
import jwt from "jsonwebtoken";
import log from "loglevel";
import cors from "cors";
import S3 from "aws-sdk/clients/s3";

import Schema from "./schema";

import "./utils/db";

import {
    CLIENT_TOKEN_SECRET,
    DEV_PORT,
    ALLOWED_ORIGINS,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET,
} from "./config";

const s3 = new S3({
    apiVersion: "2006-03-01",
    region: "us-west-2",
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET,
    },
});

const app = express().use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
    }),
);

const server = new ApolloServer({
    schema: Schema,
    introspection: true,
    context: ({ req }) => {
        if (req) {
            try {
                const decoded = jwt.verify(
                    req.headers.authorization,
                    CLIENT_TOKEN_SECRET,
                );

                return {
                    netID: decoded.netID,
                    s3Instance: s3,
                };
            } catch (err) {
                return {
                    netID: null,
                    s3Instance: s3,
                };
            }
        }

        return {
            netID: null,
            s3Instance: s3,
        };
    },
    subscriptions: {
        onConnect: (connectionParams, websocket, context) => {
            if (connectionParams.authToken) {
                try {
                    const decoded = jwt.verify(
                        connectionParams.authToken,
                        CLIENT_TOKEN_SECRET,
                    );

                    log.info(
                        `WebSocket connected from ${context.request.headers.origin} using ${websocket.protocol}`,
                    );

                    return {
                        netID: decoded.netID,
                    };
                } catch (err) {
                    websocket.close();
                    return new Error(
                        `WebSocket authentication failed due to ${err}`,
                    );
                }
            }

            return {
                netID: null,
            };
        },

        onDisconnect: (websocket, context) => {
            log.info(
                `WebSocket disconnected from ${context.request.headers.origin} using ${websocket.protocol}`,
            );
        },
    },
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: DEV_PORT }, () => {
    log.info(
        `🚀 Server ready at http://localhost:${DEV_PORT}${server.graphqlPath}`,
    );
    log.info(
        `🚀 Subscriptions ready at ws://localhost:${DEV_PORT}${server.subscriptionsPath}`,
    );
});
