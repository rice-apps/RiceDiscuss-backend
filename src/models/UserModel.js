import mongoose from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";

import composeDataloader from "../utils/dataloader";

import { COLLEGES, MAJORS, MINORS } from "../config";

const resolverList = [
    "findById",
    "findByIds",
    "findOne",
    "findMany",
    "count",
    "pagination",
    "createOne",
    "createMany",
    "updateById",
    "updateOne",
    "updateMany",
    "removeById",
    "removeOne",
    "removeMany",
];

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },

    netID: {
        type: String,
        required: true,
        unique: true,
    },

    token: {
        type: String,
        required: false,
        unique: true,
    },

    date_joined: {
        type: Date,
        required: false,
        default: new Date().getTime(),
    },

    college: {
        type: String,
        enum: COLLEGES,
        required: false,
    },

    major: {
        type: [String],
        validate: {
            validator: function (majors) {
                return majors.every((major) => MAJORS.includes(major));
            },
            message: (props) => `${props.value} has a major that's not valid!`,
        },
        required: false,
    },

    minor: {
        type: [String],
        validate: {
            validator: function (minors) {
                return minors.every((minor) => MINORS.includes(minor));
            },
            message: (props) => `${props.value} has a minor that's not valid!`,
        },
        required: false,
    },
});

const User = mongoose.model("User", UserSchema);

const UserTC = composeWithMongoose(User, {
    paginationResolverName: "pagination", // Default
    findResolverName: "findMany",
    countResolverName: "count",
    perPage: 20, // Default
});

const UserTCDL = composeDataloader(UserTC, resolverList, {
    cacheExpiration: 3000,
    removeProjection: true,
    debug: false,
});

export { User, UserTCDL as UserTC };
