import QueryResolver from './Query.js';
import PostResolver from './Post.js';
import UserResolver from './User.js';
import CommentResolver from './Comment.js';
import MutationResolver from './Mutation.js';

import { merge } from 'lodash';

// const resolvers = merge(PostResolver.Post, UserResolver.User, CommentResolver.Comment, MutationResolver.Mutation, QueryResolver.Query);
import Models from '../../model';
import mongoose from 'mongoose';

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

async function preparePost(id, param) {
    var res = await Models.Post.findById(id).select(param);
    return res[param];
}

async function prepareComment(id, param) {
    var res = await Models.Comment.findById(id).select(param);
    return res[param];
}

async function prepareUser(id, param) {
    var res = await Models.User.findById(id).select(param);
    return res[param];
}

function handleError(err) {
    console.log("\n\n---------BEGIN ERROR MESSAGE---------");
    console.log("@@@ TIME: " + Date() + " @@@\n");
    console.log(err);
    console.log("\n--------END ERROR MESSAGE------------\n\n\n");
}

const resolvers = {
    Post: {
        id: async ({ id }) => await preparePost(id, "_id"),
        creator: async ({ id }) => await preparePost(id, "creator"),
        title: async ({ id }) => await preparePost(id, "title"),
        body: async ({ id }) => await preparePost(id, "body"),
        date_created: async ({ id }) => await preparePost(id, "date_created"),
        upvotes: async ({ id }) => await preparePost(id, "upvotes"),
        downvotes: async ({ id }) => await preparePost(id, "downvotes"),
        tags: async ({ id }) => await preparePost(id, "tags"),
        postType: async ({ id }) => await preparePost(id, "postType"),
        start: async ({ id }) => await preparePost(id, "start"),
        end: async ({ id }) => await preparePost(id, "end"),
        place: async ({ id }) => await preparePost(id, "place")
    },

    User: {
        // This doesn't actual work yet, but I don't know how to get the ID for the post without using the ID as an identifier
        id: async ({ id }) => await prepareUser(id, "_id"),
        netID: async ({ id }) => await prepareUser(id, "netID"),
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
        updatePost: async (_, { id, body, title }, __, ___) => {
            const post = await Models.Post.findByID(id);
            if (body && body !== "") post.body = body;
            if (title && title !== "") post.title = title;
            await post.save();
        },
        createPost: async (_, { body, title, postType, userID }, context, ___) => {
            if (context.user.toLowerCase() !== userID) {
                return handleError("username doesn't match");
            }
            const typeT = postType && postType !== "" ? postType : "discussion"; //default to discussion
            const post = new Models.Post({
                _id: new mongoose.Types.ObjectId(),
                creator: userID,
                title: title,
                body: body,
                postType: typeT
            });

            await post.save(function (err) {
                if (err) {
                    return handleError(err);
                }
            });

            return post;
        },
        deletePost: async (_, { id }, __, ___) => {
            const post = await Models.Post.findById(id);
            post.body = "[removed]";
            post.creator = "[removed]";
            return post;
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
            await comment.save(function (err) {
                if (err) return handleError(err);
            })
            return comment;
        },
        updateComment: async (_, { id, body }, __, ___) => {
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

    Query: {
        posts: async () => {
            return await Models.Post.find();
        },
        postByID: async (_, { id }) => {
            return await Models.Post.findById(id);
        },
        postByUser: async (_, { userID }) => {
            return await Models.Post.find({ creator: userID });
        },
        users: async () => {
            return await Models.User.find();
        },
        user: async (_, { id }) => {
            return await Models.User.findById(id);
        },
        userByNetID: async (_, { netID }) => {
            return await Models.User.find({ netID: netID });
        },
        comments: async () => {
            return await Models.Comment.find();
        },
        comment: async (_, { id }) => {
            return await Models.Comment.findById(id);
        }
    }

}


export default resolvers;
