const {MongoClient} = require('mongodb');

// 1
const uri = "mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/admin?retryWrites=true&w=majority";
const dbName = "sample_airbnb";

// 2
module.exports = async () => {
  return await MongoClient.connect(uri, function(err, client) {
  	console.log('hi friend');
  	return {Listings: client.db(dbName).collection('listingsAndReviews')};
  });
}