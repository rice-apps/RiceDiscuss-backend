import Models from '../../model';

const PostResolver = {
    Post: {
        _id: async ({ _id }) => {
            return Models.Post.findById(_id).select('_id');
        },
        creator: async ({ _id }) => {
            return Models.Post.findById(_id).select('creator');
        },
        title: async ({ _id }) => {
            return Models.Post.findById(_id).select('title');
        },
        body: async ({ _id }) => {
            return Models.Post.findById(_id).select('body');
        },
        date_created: async ({ _id }) => {
            return Models.Post.findById(_id).select('date_created');
        },
        upvotes: async ({ _id }) => {
            return Models.Post.findById(_id).select('upvotes');
        },
        downvotes: async({ _id }) => {
            return Models.Post.findById(_id).select('downvotes');
        },
        tags: async ({ _id }) => {
            return Models.Post.findById(_id).select('tags');
        },
        start: async ({ _id }) => {
            return Models.Post.findById(_id).select('start');
        },
        end: async ({ _id }) => {
            return Models.Post.findById(_id).select('end');
        },
        place: async ({ _id }) => {
            return Models.Post.findById(_id).select('place');
        }
        
    }
}

export default PostResolver;
