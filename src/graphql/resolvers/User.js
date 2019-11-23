import Models from '../../model';

const UserResolver = {
    User: {
        // This doesn't actual work yet, but I don't know how to get the ID for the post without using the ID as an identifier
        _id: async ({ _id }) => {
            return Models.User.findById(_id).select('_id');
        },
        netID: async ({ _id }) => {
            return Models.User.findById(_id).select('netID');
        },
        token: async ({ _id }) => {
            return Models.User.findById(_id).select('token');
        },
        date_joined: async ({ _id }) => {
            return Models.User.findById(_id).select('date_joined');
        }
    }
}

export default UserResolver;
