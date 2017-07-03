const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcrypt');
const passport  = require('passport');
const CarModel  = require('../models/car-model.js');
const UserModel = require('../models/user-model.js');
const errorMessages = {
  alreadyExistsMessage: "The username you entered is already in use",
  noInputMessage      : "Please make sure to fill out all the fields"
};
// function checkForDbError(err) {
//   if (err) {
//     next(err);
//     return or break anonFunction (block label) or throw new Error ('error message')
//   }
// }

//-----------------------SIGNUP------------------------
router.get('/signup', (req, res, next) => {
  res.render('signup.ejs');
});

router.post('/signup', (req, res, next) => {
  if (req.body.userName === '' || req.body.password === '') {
  res.render('signup.ejs', {error: errorMessages.noInputMessage});
  return;
  }
  UserModel.findOne(
    {userName: req.body.userName},
    (err, userFromDb) => {
      if (err) return void next(err);      // check for DB error
      if(userFromDb) {
        // const alreadyExistsMessage = "The username you entered is already in use";
         res.render('signup.ejs', {error: errorMessages.alreadyExistsMessage});
          return;
      }
    const salt = bcrypt.genSaltSync(10);
    const scrambledPassword = bcrypt.hashSync(req.body.password, salt);
    const newUser = UserModel({
      fullName: req.body.fullName,
      userName: req.body.userName,
      password: scrambledPassword
    });
    newUser.save((err) => {
    if (err) return void next(err);
    res.redirect('/');
    });
    }
  );
});

//-------------------LOGIN-------------------------
router.get('/login', (req, res, next) => {
  // if(req.user) res.redirect('/');
  res.render('login.ejs');
});
router.post('/login', passport.authenticate(
  'local',
  {
    successRedirect: '/',
    failureRedirect: '/login'
  }
));

//-----------------LOGOUT--------------------------
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

//-----------------SOCIAL LOGINS--------------------

module.exports = router;
