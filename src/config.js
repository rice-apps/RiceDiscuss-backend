//const mongoose = require('mongoose');
//mongoose.Promise = global.Promise;

import { MongoClient as client } from 'mongodb';
import assert from 'assert';

const uri = "mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/admin?retryWrites=true&w=majority/sample_airbnb";
const port = 3001;
const dbName = "sample_airbnb";
const secret = "xuqzysyam5t92e97qqrf5mgx5jqjaq6s";

//var collection;

//const url = 'mongodb://localhost:27017/graphqldb';
module.exports = async () => {
	const db = await client.connect(uri);
	return { db: db.collection('listingsAndReviews'), 
			 secret: secret };
}
// client.connect(uri, function(err, client) {
//     assert.equal(null, err);
//     console.log("Connected successfully to server");

//     // const collection = client.db(dbName).collection("listingsAndReviews");

//     // var cursor = collection.find({"reviews.reviewer_name": "Mary"});

//     // cursor.forEach(iterateFunc, errorFunc);

// 	//collection = client.db(dbName).collection("listingsAndReviews");
//   });

// function iterateFunc(doc) {
//     console.log(JSON.stringify(doc.name, null, 4));
// }

// function errorFunc(error) {
// 	console.log(error);
// }

// // mongoose.connect(url, { useNewUrlParser: true });
// // mongoose.connection.once('open', () => console.log(`Connected to mongo at ${url}`));
