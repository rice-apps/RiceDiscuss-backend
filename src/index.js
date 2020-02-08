import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import bodyParser from 'body-parser';

import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';

import idp from './controllers/auth-controller';

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

  const schema = new ApolloServer({
    typeDefs,
    resolvers,
  });



  /*
  ***********
  Middleware
  ***********
  */
  app.use(bodyParser.json())

  const whitelist = ['http://localhost:3000'];
  const corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
        }
      },
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
  };

  app.use(cors(corsOptions));


  /*
  ***********
  Endpoints
  ***********
  */
  idp(app);

  const PORT = 3001;


  schema.applyMiddleware({ app, path: '/graphql'});

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
