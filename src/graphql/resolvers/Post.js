import Models from '../../model';

const PostResolver = {
    Post: {
        _id: async ({ _id }) => {
            return Models.Post.findById(_id).select('_id');
        },
        creator: async ({ _id }) => {
            return Models.Post.findById(_id).select('creator');
        },
        
    }
}
