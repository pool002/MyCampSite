const express = require('express');
const app = express();                                      //Running Express
const path = require('path');                               //Attaching directory names
const mongoose = require('mongoose');                       //Mongoose    
const ejsMate = require('ejs-mate');                        //BoilerPlate HTML
const session = require('express-session');                 //connect.sid Cookie to track users
const flash = require('connect-flash');                     //Flash Messages
const methodOverride = require('method-override');          //Changing HTTP verbs
const passport = require('passport');                       //Authentication
const LocalStrategy = require('passport-local');            //Could be Google or Yahoo, but we need Local

const campgroundRoutes = require('./routes/campgrounds');   //All Routes
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const User = require('./models/user');
const customError = require('./utils/customError');



const sessionConfig = {                                     //Configuration for the session
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

function usePassport(){                                     //Passport Essentials
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
};


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');                              //Setting the view engine for templating to be ejs
app.set('views', path.join(__dirname, 'views'));            //To use views from the app's directory
app.use(flash());                                           //Running Flash
app.use(express.urlencoded({ extended: true }));            //Parsing req.body for post request, supports x-www-form-urlencoded
app.use(methodOverride('_method'));                         //To use as a query string while changing HTTP verbs
app.use(express.static(path.join(__dirname, 'public')))     //Serving the public directory in every request
app.use(session(sessionConfig))                             //Using session for every request and passing in the config

//Calling Passport Essentials after running session.
usePassport();

//Running Mongoose and connecting to host.
mongoose.connect('mongodb://localhost:27017/camp', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })
.then(()=>console.log('DataBase Connected'))
.catch((err)=>{
    console.log(err.message);
    console.log('Couldn\'t connect to DataBase');
});


app.use((req, res, next) => {                                       //For every request...
    res.locals.currentUser = req.user;                              //It'll have the user info globally when signed in.
    if(req.user) res.locals.currentUserName = req.user.username;    //Taking the username if any.
    res.locals.success = req.flash('success');                      //Associating flash essentials.
    res.locals.error = req.flash('error');
    next();                                                         //Move on to the next thing.
})


app.use('/', userRoutes);                           //Routing          
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req, res) => { res.render('home'); });  //Serving the Home Page


app.all('*', (req, res, next) => { next(new customError(404, 'Page Not Found')); })     //If searched for anything else, return 404.

app.use((err, req, res, next) => {                      //Error Handler
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(6999, () => { console.log('Server Listening on Port 6999'); })   //Listen