const express    = require('express');
const CarModel   = require('../models/car-model.js');
const UserModel  = require('../models/user-model.js');
const requestify = require('requestify');
const router     = express.Router();

router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;
