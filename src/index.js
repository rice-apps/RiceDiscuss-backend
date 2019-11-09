const express = require('express');
//const schema = require('./schema');
import {ApolloServer, gql} from 'apollo-server-express';
const resolvers = require('./schema/resolvers');

var app = express();


//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/admin?retryWrites=true&w=majority/ricediscuss';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var Models = require('./model/models.js');


app.post('/insertData', (req, res)=>{
  var user = new Models.User( {
    username: "davidcyyi",
    netID: "dcy2",
    password: "password",
  });
  user.save(function (err) {
    if (err) return handleError(err);
  });

  User.findOne({username: "davidcyyi"}).exec(function (err, u) {
    if (err) return handleError(err);
    console.log('The author is %s', u.netID);
  });

});

const typeDefs = gql`
type Place {
    id: String!
    listing_url: String!
    name: String!
}

type Query {
    places: [Place]
}


type User {
    id: ID!
    username: String!
}
`;

// 1
const connectMongo = require('./mongo-connector');

// 2
const start = async () => {
  // 3
  const mongo = await connectMongo();
  var app = express();
  const schema = new ApolloServer({
    typeDefs,
    resolvers,
  });
  schema.applyMiddleware({ app, path: '/graphql'});

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Apollo Server on http://localhost:${PORT}/graphql.`)
  });
};

// 5
//start();
