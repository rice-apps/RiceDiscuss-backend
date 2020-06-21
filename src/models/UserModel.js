import mongoose from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";

import composeDataloader from "../utils/dataloader";

import { COLLEGES, MAJORS, MINORS } from "../config";

import {
    PAGINATION_OPTIONS,
    DATALOADER_OPTIONS,
    DATALOADER_RESOLVERS,
} from "../config";

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

const UserTC = composeWithMongoose(User, PAGINATION_OPTIONS);

const UserTCDL = composeDataloader(
    UserTC,
    DATALOADER_RESOLVERS,
    DATALOADER_OPTIONS,
);

export { User, UserTCDL as UserTC };
