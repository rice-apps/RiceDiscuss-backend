//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var PostSchema = new Schema({
	_id: Schema.Types.ObjectId,
	creator: { type: String, required: true},
	title: { type: String, required: true },
	body: { type: String, required: true },
	date_created: {type: Date, default: Date.now()},
	upvotes: [{type: String, required: true}],
	downvotes: [{type: String, required: true}],
	tags: [ { type: String } ],
	postType: { type: String, required: true, default: "discussion", 
			enum:["discussion", "job", "event"] },
	start: { type: Date, default: null },
	end: { type: Date, default: null },
	place: { type: String, default: null },
});

export default PostSchema;