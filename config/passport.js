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
