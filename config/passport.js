const passport  = require('passport');
const bcrypt    = require('bcrypt');
const UserModel = require('../models/user-model');
const CarModel  = require('../models/car-model');

passport.serializeUser((userFromDb, next) => {
  next(null, userFromDb._id);
});

passport.deserializeUser((idFromCache, next) => {
  UserModel.findById(
    idFromCache,
    (err, userFromDb) => {
      if (err) return void next(err);
      next(null, userFromDb);
    }
  );
});

//---------------LOCAL STRATEGY--------------------
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  {
    usernameField: 'loginUsername',
    passwordField: 'loginPassword'
  },
  (formUsername, formPassword, next) => {
    UserModel.findOne(
      {userName: formUsername},
      (err, userFromDb) => {
        if (err) return void next(err);
        if (!userFromDb) return void next(null, false);
        if (!bcrypt.compareSync(formPassword, userFromDb.password)){
          next(null, false);
          return;
        }
        //LOGIN succesful
         next(null, userFromDb);
      }
    );
  }
));

//------------FACEBOOK LOGIN STRATEGY----------------
const FbStrategy = require('passport-facebook').Strategy;
passport.use(new FbStrategy(
     {
       clientID:     process.env.facebookClientID,
       clientSecret: process.env.facebookClientSecret,
       callbackURL:  '/auth/facebook/callback' //whatever URL you want
     },
     (accessToken, refreshToken, profile, next) => {
      //  console.log("FACEBOOK PROFILE INFO");
      //  console.log(profile);
        UserModel.findOne(
          {facebookId: profile.id},
          (err, userFromDb) => {
            if (err) {
              next(err);
              return;
            }
            if(userFromDb) {          //if user found means he already logged in with facebook before
              next(null, userFromDb);
              return;
            }
            //if this is the first time users logs in with facebook -> SAVE them in out DB
            const theUser = new UserModel ({
              fullName: profile.displayName,
              facebookId: profile.id
            });
            theUser.save((err) => {
              if (err) {
                next(err);
                return;
              }
              next(null, theUser);
            });
          });
     }
));

//GOOGLE login strategy
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
passport.use(new GoogleStrategy(
     {
       clientID:     process.env.googleClientID,
       clientSecret: process.env.googleClientSecret,
       callbackURL:  '/auth/google/callback' //whatever URL you want
     },
     (accessToken, refreshToken, profile, next) => {
      //  console.log("GOOGLE PROFILE INFO");
      //  console.log(profile);
        UserModel.findOne(
          {googleId: profile.id},
          (err, userFromDb) => {
            if (err) {
              next(err);
              return;
            }
            if(userFromDb) {          //if user found means he already logged in with facebook before
              next(null, userFromDb);
              return;
            }
            //if this is the first time users logs in with facebook -> SAVE them in out DB
            const theUser = new UserModel ({
              fullName: profile.displayName,
              googleId: profile.id
            });

            if(theUser.fullName === undefined) {
             theUser.fullName = profile.emails[0].value;
          }

            theUser.save((err) => {
              if (err) {
                next(err);
                return;
              }
              next(null, theUser);
            });
          });
     }
));
