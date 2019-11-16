
module.exports = {
  Query: {
    places: async (root, data, {mongo: {Listings}}) => { // 1
      return await Listings.find({}).toArray(); // 2
    },

    // place: async (root, data, {mongo: {Listings}}) => {
    //   return await Listings.find({})
    // }
  },

  Place: {
      id: root => root._id || root.id,
      listing_url: root => root.listing_url,
      name: root => root.name,
    },
}
// const resolvers  = {
//   Query: {
//     // me: () => {
//     //   return {
//     //     username: 'Robin Wieruch',
//     //   };
//     // },
//     // user: () => {
//     //   return {
//     //     username: 'Dave Davids',
//     //   };
//     // },
//     place: () => {
//         return {
//             id: () => {
//           return collection.find({name: "Charming Flat in Downtown Moda"})._id;
//       },
//       listing_url: () => {
//           return collection.find({name: "Charming Flat in Downtown Moda"}).listing_url;
//       },
//       name: () => {
//           return collection.find({name: "Charming Flat in Downtown Moda"}).name;
//       }
//         };
//     }
//   },

// };