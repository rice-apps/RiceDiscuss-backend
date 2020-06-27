import express from "express";
import { ApolloServer } from "apollo-server-express";
import http from "http";
import jwt from "jsonwebtoken";
import cors from "cors";
import formidable from "formidable";
import S3 from "aws-sdk/clients/s3";

import Schema from "./schema";

import "./db";

import {
    CLIENT_TOKEN_SECRET,
    DEV_PORT,
    ALLOWED_ORIGINS,
    AWS_IDENTITY,
} from "./config";

const s3 = new S3({
    apiVersion: "2006-03-01",
    region: "us-west-2",
    credentials: {
        IdentityPoolId: AWS_IDENTITY,
    }
});

const server = new ApolloServer({
    schema: Schema,
    introspection: true,
    playground: false,
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
        onConnect: (connectionParams, _websocket, _context) => {
            if (connectionParams.authToken) {
                try {
                    const decoded = jwt.verify(
                        connectionParams.authToken,
                        CLIENT_TOKEN_SECRET,
                    );

                    console.log("Websocket connected");

                    return {
                        netID: decoded.netID,
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

app.use("/images", function (req, res) {
    const form = formidable({
        maxFileSize: 50 * 1024 * 1024,
        multiples: true,
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            throw new Error("Files parsing failed")
        }

        const Bucket = new Date().getTime().toString() + Math.random();

        s3.createBucket({
            Bucket: Bucket,
            ACL : 'public-read',
        }, (err, data) => {
            if (err) {
                throw new Error("Bucket creation failed!");
            }

            s3.putObject({
                Bucket: Bucket,
            })
        })
    });
});

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
