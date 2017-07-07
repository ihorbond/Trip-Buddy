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

//-----------------------RECOVER PASSWORD--------------
router.get('/recover-password', (req, res, next) => {
    res.render('recover-password-view.ejs');
});

router.post('/recover-password', (req, res, next) => {
         UserModel.find(
           req.body.userName,
           (err, userFromDb) => {
             if (err) return void next(err);
             if(userFromDb.securityQuestion === req.body.securityQuestions && userFromDb.securityAnswer === req.body.answer) {
               res.render('recover-password-view.ejs', {message: "Reset succesful. Your new password will be sent to the email on file"});
               return;
             }
            res.render('recover-password-view.ejs', {message: "No account matched with provided data"});
           }
         );
});

//-----------------------SIGNUP------------------------
router.get('/signup', (req, res, next) => {
  if(req.user) res.redirect('/');
  res.render('signup.ejs');
});

router.post('/signup', (req, res, next) => {
  if (req.body.userName === '' || req.body.password === '' || req.body.securityAnswer === '') {
    // console.log("------------------------Empty field triggered-------------------------");
  res.render('signup.ejs', {error: errorMessages.noInputMessage});
  return;
  }
  UserModel.findOne(
    {userName: req.body.userName},
    (err, userFromDb) => {
      console.log("-----------DB Error-----------------");
      if (err) return void next(err);      // check for DB error
      if(userFromDb) {
         res.render('signup.ejs', {error: errorMessages.alreadyExistsMessage});
          return;
      }
    const salt = bcrypt.genSaltSync(10);
    const scrambledPassword = bcrypt.hashSync(req.body.password, salt);
    const newUser = UserModel({
      fullName:         req.body.fullName,
      userName:         req.body.userName,
      password:         scrambledPassword,
      securityQuestion: req.body.securityQuestion, // how to save selected option ?
      securityAnswer:   req.body.securityAnswer
    });
    newUser.save((err) => {
      // console.log("----------------------SAVED");
    if (err) return void next(err);
    res.locals.currentUser = req.user;
    res.redirect('/login');
    });
    }
  );
});

//-------------------LOGIN-------------------------
router.get('/login', (req, res, next) => {
  if(req.user) res.redirect('/');
  res.render('login.ejs');
});
router.post('/login', passport.authenticate(
  'local',
  {
    successRedirect: '/profile',
    failureRedirect: '/login',
  }
));

//-----------------LOGOUT--------------------------
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

//-----------------SOCIAL LOGINS--------------------

module.exports = router;
