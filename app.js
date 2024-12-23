const express=require('express');
const hbs=require('express-handlebars');
const path=require('path');
const session = require('express-session');
const bodyParser=require('body-parser');
const passport=require('passport');
const googleStrategy=require('passport-google-oauth20').Strategy;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const productRouter=require('./routes/product');

const app = express();

app.use(express.json());


require('dotenv').config();

app.use(express.urlencoded({extended:true}));



app.use(express.static('public'));

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false, 
        httpOnly: true
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization/deserialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google Strategy
passport.use(new googleStrategy({
    clientID:process.env.CLIENT_ID, 
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/users/auth/google/callback'
  },
    (accessToken, refreshToken, profile, done) => {
      // The Google profile is received here
      return done(null, profile);
    }
  ));


app.use(bodyParser.urlencoded({ extended: false }));

const mongoose=require('./config/databaseConnection')


// Set up Handlebars as the view engine
app.engine('hbs',hbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'), 
    partialsDir: path.join(__dirname, 'views/partials'),
    extname: '.hbs'
}));


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Set the public directory for static files
app.use(express.static(path.join(__dirname, 'public')));
//Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/product',productRouter);

const port=3000;

app.listen(port,()=>{
    console.log("server started")
})