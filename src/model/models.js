import {CommentSchema} from './schema/Comment.js';
import {PostSchema} from './schema/Post.js';
import {UserSchema} from './schema/User.js';

var mongoose = require('mongoose');

export default Models = {
	Comment: mongoose.model('Comment', CommentSchema),
	Post: mongoose.model('Post', PostSchema),
	User: mongoose.model('User', UserSchema),
}	