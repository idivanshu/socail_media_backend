
const express = require('express');

const router = express.Router();
const {isAuth} = require('../middleware/auth');// This is the middleware

const {createPost, likeandUnlikePost, deletePost, getAllPostsoffollowing
    , updateCaption,
    createComment,deleteComment

} = require('../controllers/post');//importing the controller


// import controller
router.route('/post/upload').post(isAuth ,createPost);
router.route('/post/:id')
.get(isAuth ,likeandUnlikePost)
.delete(isAuth ,deletePost)
.put(isAuth ,updateCaption)

router.route('/post/comment/:id').put(isAuth ,createComment)
.delete(isAuth ,deleteComment);


router.route('/posts').get(isAuth ,getAllPostsoffollowing);
module.exports = router;