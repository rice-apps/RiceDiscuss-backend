import Models from '../../model';

const QueryResolver = {
    Query: {
        post: async (_id) => {
            return Models.Post.findByID(_id);
        },
        user: async (_id) => {
            return Models.User.findByID(_id);
        },
        comment: async (_id) => {
            return Models.Comment.findByID(_id);
        }
    }
}

export default QueryResolver;
