import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';

import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';

//import connectMongo from './mongo-connector.js';

var app = express();


async function connectMongo() {
//Set up default mongoose connection
var mongoDB = 'mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/ricediscuss?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

await app.post('/insertData', (req, res)=>{
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
}

// 2
const start = async () => {
  // 3
  const mongo = await connectMongo();
  var app = express();

    console.log(resolvers)
    console.log("\n\n\n\n\n")
    console.log(typeDefs)
    console.log("\n\n\n\n\n");
  const schema = new ApolloServer({
    typeDefs,
    resolvers,
  });

    console.log("\n\n\n\n\n2\n\n\n\n\n");
  schema.applyMiddleware({ app, path: '/graphql'});

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log("\n\n\n\n\n3\n\n\n\n\n");
    console.log(`Apollo Server on http://localhost:${PORT}/graphql.`)
  });
};

// 5
start();
