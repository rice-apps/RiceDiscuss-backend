let resolvers = {
    Query: {
        me: () => {
            return {
                username: 'Victor Song',
            };
        },
    },
};


export default resolvers;