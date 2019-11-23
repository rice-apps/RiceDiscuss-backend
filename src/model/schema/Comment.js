//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	_id: Schema.Types.ObjectId,
	creator: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
	post_id: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
	parent_id: {type: Schema.Types.ObjectId, required: true, ref: 'Comment'},
	date_created: {type: Date, default: Date.now()},
	body: {type: String, required: true },
	upvotes: [{type: Schema.Types.ObjectId, required: true, ref: 'User'}],
	downvotes: [{type: Schema.Types.ObjectId, required: true, ref: 'User'}],
	children: [ { type: Schema.Types.ObjectId, ref: 'Comment'} ],
	depth: { type: Number, default: 0, max: 3, required: true },
});

export default CommentSchema;