const User = require('../models/user');

module.exports.userRegistrationForm = (req, res) => {       //Render registration form.
    res.render('users/register');
};

module.exports.registerUser = async (req, res, next) => {   //Register a new user
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); //Passport registers the new user
        req.login(registeredUser, err => {      //LogingIn after registration
            if (err) {return next(err);}
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.loginForm = (req, res) => {      //Render Login Form.
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {      //User Login
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';     //Checking the requested url
    delete req.session.returnTo;    //Deleting old instance for a new one
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {     //User Logout
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
};