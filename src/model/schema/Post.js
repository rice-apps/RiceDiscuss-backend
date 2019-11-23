//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var PostSchema = new Schema({
	_id: Schema.Types.ObjectId,
	creator: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
	title: { type: String, required: true },
	body: {type: String, required: true },
	date_created: {type: Date, default: Date.now()},
	upvotes: [{type: Schema.Types.ObjectId, required: true, ref: 'User'}],
	downvotes: [{type: Schema.Types.ObjectId, required: true, ref: 'User'}],
	tags: [ { type: String } ],
	type: { type: String, required: true, default: "discussion", 
			enum:["discussion", "job", "event"] },
	start: { type: Date, default: null },
	end: { type: Date, default: null },
	place: { type: String, default: null },
});

export default PostSchema;