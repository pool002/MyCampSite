if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

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

const mongoSanitize = require('express-mongo-sanitize');    //This module searches for any keys in objects that begin with illegal signs from req.body, req.query or req.params
const helmet = require('helmet');                           //Setting security headers
const MongoDbStore = require('connect-mongo');              //To store sessions in mongo
const {connectSrcUrls,scriptSrcUrls,styleSrcUrls} = require('./allowed_Sources_Of_contentSecurityPolicy_Header');


//Running Mongoose and connecting to host.
const mongoDbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camp';
const mySecret = process.env.SECRET || 'changethissecretASAP!';

const options = {                                           //Store Options
    mongoUrl: mongoDbUrl,
    secret: mySecret,
    touchAfter: 24*60
}

mongoose.connect( mongoDbUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })
.then(()=>console.log('DataBase Connected.'))
.catch((err)=>{
    console.log(err.message);
    console.log('Couldn\'t connect to DataBase');
});


const sessionConfig = {                                     //Configuration for the session
    store: MongoDbStore.create(options),
    name: 'myCookie',
    secret: mySecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
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


app.engine('ejs', ejsMate);                                 //VULNERABLE!!!!
app.set('view engine', 'ejs');                              //Setting the view engine for templating to be ejs
app.set('views', path.join(__dirname, 'views'));            //To use views from the app's directory
app.use(flash());                                           //Running Flash
app.use(express.urlencoded({ extended: true }));            //Parsing req.body for post request, supports x-www-form-urlencoded
app.use(methodOverride('_method'));                         //To use as a query string while changing HTTP verbs
app.use(express.static(path.join(__dirname, 'public')))     //Serving the public directory in every request

app.use(session(sessionConfig))                             //Using session for every request and passing in the config

app.use(mongoSanitize());                                   //Prohibits entering dangerous characters in query or body



app.use(                                                    //Defining Content-Security-Policy Header to load from MapBox and Cloudinay.
    helmet.contentSecurityPolicy({
        directives: {
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dtfz6vdx1/", 
                "https://images.unsplash.com/",
            ],
        },
    })
);


app.use(helmet({                                            //Rest of the Headers
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));


//Calling Passport Essentials after running session.
usePassport();


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

app.get('/about', (req,res) => { res.render('about'); })    //The About Me Page

app.all('*', (req, res, next) => { next(new customError(404, 'Page Not Found')); })     //If searched for anything else, return 404.

app.use((err, req, res, next) => {                      //Error Handler
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 6999;
app.listen( port, () => { console.log(`Serving on Port ${port}`); })   //Listen