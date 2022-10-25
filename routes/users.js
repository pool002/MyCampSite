const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapper = require('../utils/wrapper');
const userController = require('../controllers/users');


router.route('/register')
    .get(userController.userRegistrationForm)
    .post(wrapper(userController.registerUser));


router.route('/login')
    .get(userController.loginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userController.loginUser); //Signin the user locally


router.get('/logout', userController.logoutUser);


module.exports = router;