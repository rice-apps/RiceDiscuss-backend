const { ApolloServer, gql } = require('apollo-server');

const Mutation = gql`
    type Mutation {
        updatePost(id: ID, body: String, title: String): Post
        createPost(body: String, title: String, type: String, username: String): Post
        deletePost(id: ID): Post
        upvotePost(id: ID, username: String): Post
        downvotePost(id: ID, username: String): Post
        
        createComment(body: String, post_id: ID, parent_id: ID, username: String): Comment
        upvoteComment(id: ID, username: String): Post
        downvoteComment(id: ID, username: String): Post
        updateComment(id: ID, body: String): Comment
        deleteComment(id: ID): Comment
    }
`;

export default Mutation;
