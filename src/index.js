import { MongoClient as client } from 'mongodb';
import assert from 'assert';

const uri = "mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/admin?retryWrites=true&w=majority";

client.connect(uri, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const collection = client.db("sample_airbnb").collection("listingsAndReviews");

    var cursor = collection.find({"reviews.reviewer_name": "Mary"});

    cursor.forEach(iterateFunc, errorFunc);
    
    client.close();
  });

  function iterateFunc(doc) {
    console.log(JSON.stringify(doc.name, null, 4));
 }
 
 function errorFunc(error) {
    console.log(error);
 }