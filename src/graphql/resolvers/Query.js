import Models from '../../model';

const QueryResolver = {
    Query: {
        posts: async () => {
            return Models.Post.find();
        },
        post: async (_, {id}) => {
            return Models.Post.findByID(id);
        },
        users: async () => {
            return Models.User.find();
        },
        user: async (_, {id}) => {
            return Models.User.findByID(id);
        },
        comments: async () => {
            return Models.Comment.find();
        },
        comment: async (_, {id}) => {
            return Models.Comment.findByID(id);
        }
    }
}

export default QueryResolver;
