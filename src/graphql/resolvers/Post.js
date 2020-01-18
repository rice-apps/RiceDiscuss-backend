import Models from '../../model';

const PostResolver = {
    Post: {
        id: async ({ id }) => {
            return Models.Post.findById(id).select('_id');
        },
        creator: async ({ id }) => {
            return Models.Post.findById(id).select('creator');
        },
        title: async ({ id }) => {
            return Models.Post.findById(id).select('title');
        },
        body: async ({ id }) => {
            return Models.Post.findById(id).select('body');
        },
        date_created: async ({ id }) => {
            return Models.Post.findById(id).select('date_created');
        },
        upvotes: async ({ id }) => {
            return Models.Post.findById(id).select('upvotes');
        },
        downvotes: async({ id }) => {
            return Models.Post.findById(id).select('downvotes');
        },
        tags: async ({ id }) => {
            return Models.Post.findById(id).select('tags');
        },
        start: async ({ id }) => {
            return Models.Post.findById(id).select('start');
        },
        end: async ({ id }) => {
            return Models.Post.findById(id).select('end');
        },
        place: async ({ id }) => {
            return Models.Post.findById(id).select('place');
        }
        
    }
}

export default PostResolver;
