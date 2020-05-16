import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
// import cors from 'cors';
import bodyParser from 'body-parser';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import jwt from 'jsonwebtoken';
import config from './config';
import request from 'request';
import Models from './model';

function handleError(err) {
  console.log("\n\n---------BEGIN ERROR MESSAGE---------");
  console.log("@@@ TIME: " + Date() + " @@@\n");
  console.log(err);
  console.log("\n--------END ERROR MESSAGE------------\n\n\n");
}

const express = require('express');
const idp = require('./controllers/auth-controller');
var app = express();

const mongoDB = 'mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/ricediscuss?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new ApolloServer({
  typeDefs,
  resolvers
});

// Sample post data 
app.post('/insertData', (req, res) => {
    var user = new Models.User({
      _id: mongoose.Types.ObjectId(),
      username: "davidcyyi",
      netID: "sg71",
      password: "password1234"
    });
    user.save(function (err) {
      if (err)
        return handleError(err);
    });
    user.constructor.findOne({ username: "davidcyyi" }).exec(function (err, u) {
      if (err)
        return handleError(err);
      console.log('The author is %s', u.netID);
    });
});

app.use('/hi', (req, res) => {
  console.log(req.body);
  console.log("in hi endpoint");
  res.send("hello");
})

schema.applyMiddleware({ app, path: '/graphql'});
const PORT = 3000;

idp(app);

app.listen(PORT, () => {
  console.log(`Apollo Server on http://localhost:${PORT}/graphql`)
});



// async function connectMongo() {
//   //Set up default mongoose connection
//   var mongoDB = 'mongodb+srv://davidcyyi:123@shryans-mr8uh.mongodb.net/ricediscuss?retryWrites=true&w=majority';
//   mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//   //Get the default connection
//   var db = mongoose.connection;

//   //Bind connection to error event (to get notification of connection errors)
//   db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//   app.post('/insertData', (req, res) => {
//     var user = new Models.User({
//       username: "davidcyyi",
//       netID: "dcy2",
//       password: "password",
//     });
//     user.save(function (err) {
//       if (err)
//         return handleError(err);
//     });
//     user.findOne({ username: "davidcyyi" }).exec(function (err, u) {
//       if (err)
//         return handleError(err);
//       console.log('The author is %s', u.netID);
//     });
//   });
// }

// // 2
// const start = async () => {
//   // 3
//   const mongo = await connectMongo();

//   const schema = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//   /*
//   ***********
//   Middleware
//   ***********
//   */

//   const whitelist = ['http://localhost:3000', 'http://localhost:3001'];

//   const corsOptions = {
//     origin: function (origin, callback) {
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true)
//       } else {
//         callback(new Error('Not allowed by CORS'))

//       }
//     },
//     optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
//     credentials: true,
//   };

//   app.use(cors(corsOptions));

//   // schema.applyMiddleware({ app, path: '/graphql' });
//   app.use(bodyParser.json());

//   /*
//   ***********
//   Endpoints
//   ***********
//   */
//   idp(app);

//   app.use('/hi', (req, res) => {
//     console.log(req.body);
//     console.log("in hi endpoint");
//     res.send("hello");
//   })

//   const PORT = 3001;
//   schema.applyMiddleware({ app, path: '/graphql'});

//   /*
//   ***********
//   Server
//   ***********
//   */
//   app.listen(PORT, () => {
//     console.log(`Apollo Server on http://localhost:${PORT}/graphql.`)
//   });
// };

// // 5
// start();
