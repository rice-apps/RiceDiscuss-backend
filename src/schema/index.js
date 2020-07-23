import { sc } from "graphql-compose";
import S3 from "aws-sdk/clients/s3";

import { DiscussionTC, EventTC, JobTC, NoticeTC, User } from "../models";

import {
    CommentQuery,
    CommentMutation,
    CommentSubscription,
} from "./CommentSchema";
import { PostQuery, PostMutation, PostSubscription } from "./PostSchema";
import { UserQuery, UserMutation, UserSubscription } from "./UserSchema";

import { AWS_ACCESS_KEY_ID, AWS_SECRET, BUCKET } from "../config";

sc.addSchemaMustHaveType(DiscussionTC)
    .addSchemaMustHaveType(EventTC)
    .addSchemaMustHaveType(JobTC)
    .addSchemaMustHaveType(NoticeTC);

const doesUsernameExist = sc.createResolver({
    name: "doesUsernameExist",
    type: 'type BooleanPayload { usernameExists: Boolean! }',
    args: {
        username: `String!`
    },
    resolve: async ({args, context}) => {
        if (!context.netID) {
            return new Error("Not logged in. Stop trying to access the data");
        }

        const usernameExists = await User.exists({
            username: args.username,
        }).catch((err) => log.error(err));

        return {
            usernameExists
        };
    }
});


const signS3Url = sc.createResolver({
    name: "signS3Url",
    type: `type S3Payload { signedRequest: String!, url: String! }`,
    args: {
        filename: `String!`,
        filetype: `String!`,
    },
    resolve: async ({ args, context }) => {
        if (!context.netID) {
            return new Error("Not logged in. Can't upload image");
        }

        const s3 = new S3({
            apiVersion: "2006-03-01",
            region: "us-west-2",
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET,
            },
        });

        const s3Params = {
            Bucket: BUCKET,
            Key: args.filename,
            Expires: 60,
            ContentType: args.filetype,
            ACL: "public-read",
        };

        const signedRequest = s3.getSignedUrl("putObject", s3Params);
        const url = `https://${BUCKET}.s3.amazonaws.com/${args.filename}`;

        return {
            signedRequest,
            url,
        };
    },
});

sc.Query.addFields({
    ...CommentQuery,
    ...PostQuery,
    ...UserQuery,
    doesUsernameExist
});

sc.Mutation.addFields({
    ...CommentMutation,
    ...PostMutation,
    ...UserMutation,
    signS3Url,
});

sc.Subscription.addFields({
    ...CommentSubscription,
    ...PostSubscription,
    ...UserSubscription,
});

const Schema = sc.buildSchema();

export default Schema;
