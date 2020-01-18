//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	_id: Schema.Types.ObjectId,
	username: { type: String, required: true },
	netID: { type: String, required: true },
	token: {type: String, required: true },
	date_joined: {type: Date, default: Date.now()},
});

export default UserSchema;