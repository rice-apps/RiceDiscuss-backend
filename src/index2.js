import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { MongoClient as client } from 'mongodb';
import assert from 'assert';
import cors from 'cors';

const connect = require('./config');

console.log(db);
const collection = db.collection("listingsAndReviews");
collection.findOne({name: "Charming Flat in Downtown Moda"}).then((str) => console.log(str));
console.log(collection.findOne({name: "Charming Flat in Downtown Moda"}));
const schema = gql`
type Place {
    id: String!
    listing_url: String!
    name: String!
}

type Query {
    place: Place
}


type User {
    id: ID!
    username: String!
}
`;

const resolvers  = {
  Query: {
    // me: () => {
    //   return {
    //     username: 'Robin Wieruch',
    //   };
    // },
    // user: () => {
    //   return {
    //     username: 'Dave Davids',
    //   };
    // },
    place: () => {
        return {
            id: () => {
          return collection.find({name: "Charming Flat in Downtown Moda"})._id;
      },
      listing_url: () => {
          return collection.find({name: "Charming Flat in Downtown Moda"}).listing_url;
      },
      name: () => {
          return collection.find({name: "Charming Flat in Downtown Moda"}).name;
      }
        };
    }
  },

};

const app = express();

app.use(cors());


const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});
server.applyMiddleware({ app, path: '/graphql' });
app.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});
