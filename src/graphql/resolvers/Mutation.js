import Models from '../../model';

async function upvote(username, post){
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

async function downvote(username, post) {
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
        async updatePost (id, body, title) {
            const post = await Models.Post.findByID(id);
            if (body && body !== "") post.body = body;
            if (title && title !== "") post.title = title;
            await post.save();
        },
        async createPost (root, {body, title, type, userID}) {
            if (type && type !== "")
                type = "discussion";
            const post = new Models.Post({creator: userID, title: title, postType: type, body: body});
            
            return await post.save();

            // return post;

            //await Models.Post.create({creator: userID, title: title, postType: type, body: body});

            //return await Models.Post.findById("5e5ac6960bd326de24b71b45");
        },
        async deletePost (id) {
            const post = await Models.Post.findById(id);
            post.body = "[removed]";
            post.creator = "[removed]";
            return post;
        },
        upvotePost:  async (id, username) => {
            const post = await Models.Post.findByID(id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, post);
        },
        downvotePost:  async (id, username) => {
            const post = await Models.Post.findByID(id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, post);
        },

        createComment:  async (body, postid, parentid, username) => {
            var parent;
            let depth = 0;
            console.log("hi");
            if (parentid) {
                parent = await Models.Comment.findByID(parentid);
                if (parent.depth >= 3) {
                    return;//someway to return failure
                }
                depth = parent.depth + 1;
            }
            const comment = new Models.Comment({postid: postid, 
                creator: username, parentid: parentid, body: body, depth: depth});
            await comment.save(function (err) {
                if (err) return handleError(err);
            })
            console.log(comment);
            return comment;
        },
        updateComment: async (id, body) => {
            const comment = await Models.Comment.findByID(id);
            if (body && body !== "") comment.body = body;
            await comment.save();
            return comment;
        },
        deleteComment: async (id) => {
            const comment = await Models.Comment.findById(id);
            comment.body = "[removed]";
            comment.creator = "[removed]";
            comment.save(function (err) {
                if (err) return handleError(err);
            });
            return comment;
        },

        upvoteComment:  async (id, username) => {
            const comment = await Models.Comment.findByID(id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, comment);
        },
        downvoteComment:  async (id, username) => {
            const comment = await Models.Comment.findByID(id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, comment);
        },
    }
}

export default MutationResolver;
