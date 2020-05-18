import Models from '../../model';

// function handleError(err) {
//     console.log("\n\n---------BEGIN ERROR MESSAGE---------");
//     console.log("@@@ TIME: " + Date() + " @@@\n");
//     console.log(err);
//     console.log("\n--------END ERROR MESSAGE------------\n\n\n");
// }

const QueryResolver = {
    Query: {
        posts: async () => {
            return await Models.Post.find();
        },
        postByID: async (_, { id }) => {
            return await Models.Post.findById(id);
        },
        postByUser: async (_, { userID }) => {
            return await Models.Post.find({ creator: userID });
        },
        users: async () => {
            return await Models.User.find();
        },
        user: async (_, { id }) => {
            return await Models.User.findById(id);
        },
        userByNetID: async (_, { netID }) => {
            return await Models.User.find({ netID: netID });
        },
        comments: async () => {
            return await Models.Comment.find();
        },
        comment: async (_, { id }, context,info) => {
            console.log(info);
            return await Models.Comment.findById(id);
        }
    }
}

export default QueryResolver;
