import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

import composeDataloader from '../utils/dataloader';

const resolverList = ['findById', 'findByIds', 'findOne', 'findMany',
    'count', 'createOne', 'createMany', 'updateById', 'updateOne',
    'updateMany', 'removeById', 'removeOne', 'removeMany'];

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

    date_joined: {
        type: Date,
        required: false,
        default: (new Date()).getTime(),
    },

    // We should store expiry date and net ID in the token.
    token: {
        type: String,
        required: false,
        unique: true,
    },
});

const User = mongoose.model('User', UserSchema);
const UserTC = composeWithMongoose(User);

const UserTCDL = composeDataloader(UserTC, resolverList, {
    cacheExpiration: 3000,
    removeProjection: true,
    debug: false,
});

export {
    User,
    UserTCDL as UserTC,
};
