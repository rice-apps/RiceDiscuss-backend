//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	_id: Schema.Types.ObjectId,
	creator: { type: String, required: true},
	post_id: { type: Schema.Types.ObjectId, required: true, ref: 'Post' },
	parent_id: {type: Schema.Types.ObjectId, required: true, ref: 'Comment'},
	date_created: {type: Date, default: Date.now()},
	body: {type: String, required: true },
	upvotes: [{type: String, required: true}],
	downvotes: [{type: String, required: true}],
	children: [ { type: Schema.Types.ObjectId, ref: 'Comment'} ],
	depth: { type: Number, default: 0, max: 3, required: true },
});

export default CommentSchema;