import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';

import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';

import jwt from 'jsonwebtoken';
import idp from './controllers/auth-controller';
import config from './config';

import request from 'request';

//import connectMongo from './mongo-connector.js';

request("https://idp.rice.edu/idp/profile/cas/login?service=http://localhost:3000", function(err, response, body) {
  console.log(err);
  console.log(response);
  console.log(body);
});

var app = express();


async function connectMongo() {
  //Set up default mongoose connection
  var mongoDB = 'mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/ricediscuss?retryWrites=true&w=majority';
  mongoose.connect(mongoDB, { useNewUrlParser: true });

  //Get the default connection
  var db = mongoose.connection;

  //Bind connection to error event (to get notification of connection errors)
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));

  app.post('/insertData', (req, res) => {
    var user = new Models.User({
      username: "davidcyyi",
      netID: "dcy2",
      password: "password",
    });
    user.save(function (err) {
      if (err)
        return handleError(err);
    });
    user.findOne({ username: "davidcyyi" }).exec(function (err, u) {
      if (err)
        return handleError(err);
      console.log('The author is %s', u.netID);
    });
  });
}

// 2
const start = async () => {
  // 3
  const mongo = await connectMongo();
  var app = express();

  const schema = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => {
      const token = req.body.token || req.query.token || req.headers['x-access-token'];

      if (token) {
        try {
          var decoded = jwt.verify(token, config.secret);
        } catch (err) {
          return { success: false, message: "token authentication failed", user: null };
        }

        return { success: true, message: "Authentication successful", user: decoded.user };
      }

      return { success: false, message: "No token provided", user: null };
    },
  });



  /*
  ***********
  Middleware
  ***********
  */
  schema.applyMiddleware({ app, path: '/graphql' });

  /*
  ***********
  Endpoints
  ***********
  */
  idp(app);

  const PORT = 3001;

  /*
  ***********
  Server
  ***********
  */
  app.listen(PORT, () => {
    console.log(`Apollo Server on http://localhost:${PORT}/graphql.`)
  });
};

// 5
start();
