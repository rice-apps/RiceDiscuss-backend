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
