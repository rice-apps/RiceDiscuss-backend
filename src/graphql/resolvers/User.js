import Models from '../../model';

const UserResolver = {
    User: {
        // This doesn't actual work yet, but I don't know how to get the ID for the post without using the ID as an identifier
        id: async ({ id }) => {
            return Models.User.findById(id).select('_id');
        },
        netID: async ({ id }) => {
            return Models.User.findById(id).select('netID');
        },
        token: async ({ id }) => {
            return Models.User.findById(id).select('token');
        },
        date_joined: async ({ id }) => {
            return Models.User.findById(id).select('date_joined');
        }
    }
}

export default UserResolver;
