const express    = require('express');
const CarModel   = require('../models/car-model.js');
const UserModel  = require('../models/user-model.js');
const requestify = require('requestify');
const router     = express.Router();

function calculateExpenses(distance, mpg) {
  return ;
}

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/new-trip', (req, res, next) => {
  res.render('new-trip-view.ejs');
});
  
router.get('/contact-us', (req, res, next) => {
  res.render('contact-us.ejs');
});


module.exports = router;
