import { SchemaComposer } from "graphql-compose";

import { DiscussionTC, EventTC, JobTC, NoticeTC } from "../models";

import {
    CommentQuery,
    CommentMutation,
    CommentSubscription,
} from "./CommentSchema";
import { PostQuery, PostMutation, PostSubscription } from "./PostSchema";
import { UserQuery, UserMutation, UserSubscription } from "./UserSchema";

const sc = new SchemaComposer();

sc.addSchemaMustHaveType(DiscussionTC)
    .addSchemaMustHaveType(EventTC)
    .addSchemaMustHaveType(JobTC)
    .addSchemaMustHaveType(NoticeTC);

sc.createResolver({
    name: "signS3Url",
    type: `type S3Payload { signedRequest: String!, url: String! }`,
    args: {
        filename: "String!",
        filetype: "String!",
    },
    resolve: async ({ args, context }) => {
        if (!context.netID) {
            return new Error("Not logged in. Can't ");
        }

        const s3Bucket = "";

        const s3Params = {
            Bucket: s3Bucket,
            Key: args.filename,
            Expires: 60,
            ContentType: args.filetype,
            ACL: "public-read",
        };

        const signedRequest = await context.s3.getSignedUrl(
            "putObject",
            s3Params,
        );
        const url = `https://${s3Bucket}.s3.amazonaws.com/${args.filename}`;

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
});

sc.Mutation.addFields({
    ...CommentMutation,
    ...PostMutation,
    ...UserMutation,
});

sc.Subscription.addFields({
    ...CommentSubscription,
    ...PostSubscription,
    ...UserSubscription,
});

const Schema = sc.buildSchema();

export default Schema;
