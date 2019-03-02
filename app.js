const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');
const session      = require('express-session');
const passport     = require('passport');

require('dotenv').config();
require('./config/passport.js');
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title         = 'Trip Buddy';
app.locals.googleMapsKey = process.env.MAP_KEY;

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(session({
  secret:            process.env.session_secret,
  resave:            true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

//let's check whether the user is logged in
app.use((req, res, next) => {
  // res.locals.currentUser = null;
  if (req.user) {
    res.locals.currentUser = req.user;
  }
  next();
});

const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth-routes');
app.use('/', auth);

const signedUp = require('./routes/signed-up-routes');
app.use('/', signedUp);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
