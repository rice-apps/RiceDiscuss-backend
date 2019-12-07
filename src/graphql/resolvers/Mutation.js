import Models from '../../model';

function upvote(username, post){
    if (post.creator === username || post.upvotes.contains(username)) return post;
            
    var index = post.downvotes.indexOf(username);
    if (index) {
        post.downvotes.splice(index, 1);
    }
    post.upvotes.append(username);
    await post.save(function (err) {
      if (err) return handleError(err);
    });
    return post;
}

function downvote(username, post) {
    if (post.creator === username || post.downvotes.contains(username)) return post;

    var index = post.upvotes.indexOf(username);
    if (index) {
        post.upvotes.splice(index, 1);
    }
    post.downvotes.append(username);
    await post.save(function (err) {
      if (err) return handleError(err);
    });
    return post;
}

const MutationResolver = {
    Mutation: {
        updatePost: async (_id, body, title) => {
            const post = await Models.Post.findByID(_id);
            if (body && body !== "") post.body = body;
            if (title && title !== "") post.title = title;
            await post.save();
        },
        createPost: async (body, title, type, userID) => {
            const typeT = type && type !== "" ? type : "discussion"; //default to discussion
            const post = new Models.Post({creator: userID, title: title, type: typeT, body: body});
            
            await post.save(function (err) {
              if (err) return handleError(err);
            });

            return post;
        },
        deletePost: async (_id) => {
            const post = await Models.Post.findById(_id);
            post.body = "[removed]";
            post.creator = "[removed]";
            return post;
        },
        upvotePost:  async (_id, username) => {
            const post = await Models.Post.findByID(_id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, post);
        },
        downvotePost:  async (_id, username) => {
            const post = await Models.Post.findByID(_id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, post);
        },

        createComment:  async (body, post_id, parent_id, username) => {
            const parent;
            let depth = 0;
            if (parent_id) {
                parent = await Models.Comment.findByID(parent_id);
                if (parent.depth >= 3) {
                    return;//someway to return failure
                }
                depth = parent.depth + 1;
            }
            const comment = new Models.Comment({post_id: post_id, 
                creator: username, parent_id: parent_id, body: body, depth: depth});
            await comment.save(function (err) {
                if (err) return handleError(err);
            })
            return comment;
        },
        updateComment: async (_id, body) => {
            const comment = await Models.Comment.findByID(_id);
            if (body && body !== "") comment.body = body;
            await comment.save();
            return comment;
        },
        deleteComment: async (_id) => {
            const comment = await Models.Comment.findById(_id);
            comment.body = "[removed]";
            comment.creator = "[removed]";
            comment.save(function (err) {
                if (err) return handleError(err);
            });
            return comment;
        },

        upvoteComment:  async (_id, username) => {
            const comment = await Models.Comment.findByID(_id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, comment);
        },
        downvoteComment:  async (_id, username) => {
            const comment = await Models.Comment.findByID(_id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, comment);
        },
    }
}

export default MutationResolver;
