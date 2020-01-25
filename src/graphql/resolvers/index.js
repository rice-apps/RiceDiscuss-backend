import QueryResolver from './Query.js';
import PostResolver from './Post.js';
import UserResolver from './User.js';
import CommentResolver from './Comment.js';
import MutationResolver from './Mutation.js';

import { merge } from 'lodash';

// const resolvers = merge(PostResolver.Post, UserResolver.User, CommentResolver.Comment, MutationResolver.Mutation, QueryResolver.Query);
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

async function preparePost (id, param){
    var res = await Models.Post.findById(id).select(param);
    return res[param];
}

async function prepareComment (id, param){
    var res = await Models.Comment.findById(id).select(param);
    return res[param];
}

async function prepareUser (id, param) {
    var res = await Models.User.findById(id).select(param);
    return res[param];
}


const resolvers = {
	Post: {
        id: async ({ id }) => await preparePost(id, "_id"),
        creator: async ({ id }) => await preparePost(id, "creator"),
        title: async ({ id }) => await  preparePost(id, "title"),
        body: async ({ id }) => await  preparePost(id, "body"),
        date_created: async ({ id }) => await  preparePost(id, "date_created"),
        upvotes: async ({ id }) => await  preparePost(id, "upvotes"),
        downvotes: async({ id }) => await preparePost(id, "downvotes"),
        tags: async ({ id }) => await preparePost(id, "tags"),
        start: async ({ id }) => await preparePost(id, "start"),
        end: async ({ id }) => await preparePost(id, "end"),
        place: async ({ id }) => await preparePost(id, "place")        
    },

    User: {
        // This doesn't actual work yet, but I don't know how to get the ID for the post without using the ID as an identifier
        id: async ({ id }) => await prepareUser(id, "_id"),
        netID: async ({ id }) => await prepareUser(id, "netID"),
        token: async ({ id }) => await prepareUser(id, "token"),
        date_joined: async ({ id }) => await prepareUser(id, "date_joined")
    },

    Comment: {
        id: async ({ id }) => await prepareComment(id, "_id"),
        creator: async ({ id }) => await prepareComment(id, "creator"),
        post_id: async ({ id }) => await prepareComment(id, "post_id"),
        date_created: async ({ id }) => await prepareComment(id, "date_created"),
        body: async ({ id }) => await prepareComment(id, "body"),
        upvotes: async ({ id }) => await prepareComment(id, "upvotes"),
        downvotes: async ({ id }) => await prepareComment(id, "downvotes"),
        children: async ({ id }) => await prepareComment(id, "children"),
        depth: async ({ id }) => await prepareComment(id, "depth")
    },

    Mutation: {
        updatePost: async (id, body, title) => {
            const post = await Models.Post.findByID(id);
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
        deletePost: async (id) => {
            const post = await Models.Post.findById(id);
            post.body = "[removed]";
            post.creator = "[removed]";
            return post;
        },
        upvotePost:  async (id, username) => {
            const post = await Models.Post.findById(id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, post);
        },
        downvotePost:  async (id, username) => {
            const post = await Models.Post.findById(id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, post);
        },

        createComment:  async (body, postid, parentid, username) => {
            var parent;
            let depth = 0;
            if (parentid) {
                parent = await Models.Comment.findById(parentid);
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
            return comment;
        },
        updateComment: async (id, body) => {
            const comment = await Models.Comment.findById(id);
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
            const comment = await Models.Comment.findById(id);
            //check if userID already in upvotes/downvotes/author
            return upvote(username, comment);
        },
        downvoteComment:  async (id, username) => {
            const comment = await Models.Comment.findById(id);
            //check if userID already in upvotes/downvotes/author
            return downvote(username, comment);
        },
    },

    Query: {
        posts: async () => {
            return Models.Post.find();
        },
        post: async (_, {id}) => {
            return Models.Post.findById(id);
        },
        users: async () => {
            return Models.User.find();
        },
        user: async (_, {id}) => {
            return Models.User.findById(id);
        },
        comments: async () => {
            return Models.Comment.find();
        },
        comment: async (_, {id}) => {
            return Models.Comment.findById(id);
        }
    }

}


export default resolvers;
