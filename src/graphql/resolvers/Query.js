import Models from '../../model';

const QueryResolver = {
    Query: {
        posts: async () => {
            return Models.Post.find();
        },
        post: async (_, {_id}) => {
            return Models.Post.findByID(_id);
        },
        users: async () => {
            return Models.User.find();
        },
        user: async (_, {_id}) => {
            return Models.User.findByID(_id);
        },
        comments: async () => {
            return Models.Comment.find();
        },
        comment: async (_, {_id}) => {
            return Models.Comment.findByID(_id);
        }
    }
}

export default QueryResolver;
