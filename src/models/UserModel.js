import mongoose from "mongoose";
import { composeWithMongoose } from "graphql-compose-mongoose";

import composeDataloader from "../utils/dataloader";

import { COLLEGES, MAJORS, MINORS } from "../config";

import { DATALOADER_OPTIONS, DATALOADER_RESOLVERS } from "../config";

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
        index: true,
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

    isNewUser: {
        type: Boolean,
        default: true,
    },
});

const User = mongoose.model("User", UserSchema);

const UserTC = composeWithMongoose(User);

UserTC.wrapResolverResolve("findOne", (next) => async (rp) => {
    const resPromise = next(rp);

    resPromise.then((payload) => {
        if (payload.netID != rp.context.netID) {
            payload.token = null;
        }
    });

    return resPromise;
});

UserTC.wrapResolverResolve("pagination", (next) => async (rp) => {
    const resPromise = next(rp);

    resPromise.then((payload) => {
        for (let i = 0; i < payload.items.length; i++) {
            if (payload.items[i].netID != rp.context.netID) {
                payload.items[i].token = null;
            }
        }
    });

    return resPromise;
});

const UserTCDL = composeDataloader(
    UserTC,
    DATALOADER_RESOLVERS,
    DATALOADER_OPTIONS,
);

export { User, UserTCDL as UserTC };
