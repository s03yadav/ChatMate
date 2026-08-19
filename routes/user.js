const express = require('express');
const router = express.Router();
const uploads = require('../middleware/multer');
const { handle, handleSignupForm, handleSignUp, handleLogin, handleLoginForm, handleHome} = require('../controllers/user');
const { handleSession } = require('../middleware/user');
const { handleTeamCreation } = require('../controllers/chat');

router.route('/signup').get(handleSignUp).post(uploads.single('profileImage') ,handleSignupForm);
router.route('/login').get(handleLogin).post(handleLoginForm);
router.route('/home').get( handleSession, handleHome).post( uploads.single('groupImage'), handleSession ,handleTeamCreation);
module.exports = router;