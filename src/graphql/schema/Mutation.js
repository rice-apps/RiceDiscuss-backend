import gql from 'apollo-server-express';

const Mutation = gql`
    type Mutation {
        updatePost(_id: ID, body: String, title: String): Post
        createPost(body: String, title: String, type: String, username: String): Post
        deletePost(_id: ID): Post
        upvotePost(_id: ID, username: String): Post
        downvotePost(_id: ID, username: String): Post
        
        createComment(body: String, post_id: ID, parent_id: ID, username: String): Comment
        upvoteComment(_id: ID, username: String): Post
        downvoteComment(_id: ID, username: String): Post
        updateComment(_id: ID, body: String): Comment
        deleteComment(_id: ID): Comment
    }
`;

export default Mutation;
