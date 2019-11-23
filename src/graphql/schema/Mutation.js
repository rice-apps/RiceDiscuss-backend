import gql from 'apollo-server-express';

const Mutation = gql`
    type Mutation {
        updatePost(_id: ID, body: String, title: String): Post
        createPost(body: String, title: String): Post
        deletePost(_id: ID): Post

        upvotePost(_id: ID): Post
        downvotePost(_id: ID): Post
        
        createComment(body: String, post_id: ID, parent_id: ID): Comment
        updateComment(body: String, post_id: ID): Comment
        deleteComment(post_id: ID): Comment

        user(_id: ID): User
        comment(_id: ID): Comment
    }
`;

export default Mutation;
