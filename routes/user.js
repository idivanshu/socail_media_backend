
const express = require('express');
const {isAuth} = require('../middleware/auth');
const router = express.Router();




const {register} = require('../controllers/user');//importing the controller
const {login} = require('../controllers/user');//importing the controller
const {
    followUser,logout, updatePassword
    , updateProfile , deleteMyProfile, 
    getMyProfile,getOtherUserProfile
    ,forgotPassword, resetPassword
}= require('../controllers/user');//importing the controller
// import controller
router.route('/register').post(register);//we are using the function createPost from the controller
router.route('/login').post(login);//we are using the function login from the controller
router.route('/logout').get(logout);//we are using the function logout from the controller
router.route("/follow/:id").get(isAuth, followUser);
router.route("/update/Password").post(isAuth, updatePassword);
router.route("/update/Profile").post(isAuth, updateProfile);
router.route("/delete/me").delete(isAuth, deleteMyProfile);
router.route("/me").get(isAuth, getMyProfile);
router.route("/:id").get(isAuth, getOtherUserProfile);


router.route("/forgot/password").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
module.exports = router;