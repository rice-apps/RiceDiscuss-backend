import Models from '../../model';

async function prepareUser(id, param) {
    var res = await Models.User.findById(id).select(param);
    return res[param];
}

const UserResolver = {
    User: {
        // This doesn't actual work yet, but I don't know how to get the ID for the post without using the ID as an identifier
        id: async ({ id }) => await prepareUser(id, "_id"),
        netID: async ({ id }) => await prepareUser(id, "netID"),
        username: async ({ id }) => await prepareUser(id, "username"),
        date_joined: async ({ id }) => await prepareUser(id, "date_joined"),
    },
};

export default UserResolver;
