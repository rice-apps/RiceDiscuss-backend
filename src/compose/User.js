import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import { schemaComposer } from 'graphql-compose';

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

const UserTC = composeWithMongoose(User, {});

schemaComposer.Query.addFields({
    userById: UserTC.getResolver('findById'),
    userByIds: UserTC.getResolver('findByIds'),
    userOne: UserTC.getResolver('findOne'),
    userMany: UserTC.getResolver('findMany'),
    userCount: UserTC.getResolver('count'), 
});

schemaComposer.Mutation.addFields({
    userCreateOne: UserTC.getResolver('createOne'),
    userCreateMany: UserTC.getResolver('createMany'),
    userUpdateById: UserTC.getResolver('updateById'),
    userUpdateOne: UserTC.getResolver('updateOne'),
    userUpdateMany: UserTC.getResolver('updateMany'),
    userRemoveById: UserTC.getResolver('removeById'),
    userRemoveOne: UserTC.getResolver('removeOne'),
    userRemoveMany: UserTC.getResolver('removeMany'),
  });

  const UserGQLSchema = schemaComposer.buildSchema();

  export default UserGQLSchema;
