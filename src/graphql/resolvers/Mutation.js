import Models from '../../model';

async function upvote(username, post) {
    if (post.creator === username || post.upvotes.contains(username)) return post;

    var index = post.downvotes.indexOf(username);
    if (index) {
        post.downvotes.splice(index, 1);
    }
    post.upvotes.append(username);
    await post.save(function (err) {
        if (err) return handleError(err);
    });
    return await post.save({ j: true });
}

async function downvote(username, post) {
    if (post.creator === username || post.downvotes.contains(username)) return post;

    var index = post.upvotes.indexOf(username);
    if (index) {
        post.upvotes.splice(index, 1);
    }
    post.downvotes.append(username);
    
    return await post.save({ j: true });
}

const MutationResolver = {
    Mutation: {
        updatePost: async (_, { id, body, title }, __, ___) => {
            const post = await Models.Post.findByID(id);
            if (body && body !== "") post.body = body;
            if (title && title !== "") post.title = title;
            return await post.save({ j: true });
        },
        createPost: async (_, { body, title, postType, userID }, context, ___) => {
            // if (context.user.toLowerCase() !== userID) {
            //     return handleError("username doesn't match");
            // }
            const typeT = postType && postType !== "" ? postType : "discussion"; //default to discussion
            const i = mongoose.Types.ObjectId();
            const post = new Models.Post({
                _id: i,
                creator: userID,
                title: title,
                body: body,
                postType: typeT
            });

            return await post.save({ j: true });
        },
        deletePost: async (_, { id }, __, ___) => {
            const post = await Models.Post.findByIdAndDelete(id);
            // TODO: Delete the corresponding comments
            // post.body = "[removed]";
            // post.creator = "[removed]";
            return await post;
        },
        upvotePost: async (_, { id, username }, __, ___) => {
            const post = await Models.Post.findById(id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, post);
        },
        downvotePost: async (_, { id, username }, __, ___) => {
            const post = await Models.Post.findById(id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, post);
        },

        createComment: async (_, { body, postid, parentid, username }, __, ___) => {
            var parent;
            let depth = 0;
            if (parentid) {
                parent = await Models.Comment.findById(parentid);
                if (parent.depth >= 3) {
                    return;//someway to return failure
                }
                depth = parent.depth + 1;
            }

            const comment = new Models.Comment({
                _id: mongoose.Types.ObjectId(), post_id: mongoose.Types.ObjectId(postid),
                creator: username, parent_id: parentid, body: body, depth: depth
            });
            
            return await comment.save({ j: true });
        },
        updateComment: async (_, { id, body }, __, ___) => {
            const comment = await Models.Comment.findById(id);
            if (body && body !== "") comment.body = body;
            return await comment.save({ j: true });
        },
        deleteComment: async (id) => {
            const comment = await Models.Comment.findByIdAndDelete(id);
            
            return await comment.exec();
        },

        upvoteComment: async (id, username) => {
            const comment = await Models.Comment.findById(id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, comment);
        },
        downvoteComment: async (id, username) => {
            const comment = await Models.Comment.findById(id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, comment);
        },
    },
};

export default MutationResolver;
