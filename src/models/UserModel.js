import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    netID: {
        type: String,
        required: true,
    },

    date_joined: {
        type: Date,
        required: true,
    },

    // We should store expiry date and net ID in the token.
    token: {
        type: String,
        required: false,
    },
});
const User = mongoose.model('User', UserSchema);
const UserTC = composeWithMongoose(User);

UserTC.addResolver({
    name: 'findByNetID',

    args: {
        netID: 'String',
    },

    type: UserTC,

    resolve: async ({ source, args, context, info }) => {
        return await User.findOne({ netID: args.netID });
    },
});

UserTC.addResolver({
    name: "updateByNetID",

    args: {
        netID: 'String',
        newInfo: 'JSON',
    },

    type: UserTC,

    resolve: async ({ source, args, context, info }) => {
        var target = await User.findOne({ netID: args.netID });

        await target.updateOne({ $set: args.newInfo });

        return await target.save();
    },
});

UserTC.addResolver({
    name: "removeByNetID",

    args: {
        netID: 'String',
    },

    type: UserTC,

    resolve: async ({ source, args, context, info }) => {
        var target = await User.findOne({netID: args.netID});

        return await target.remove();
    }
})

export {
    User,
    UserTC,
};
