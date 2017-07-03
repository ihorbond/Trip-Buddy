const express = require('express');
const router  = express.Router();
const CarModel  = require('../models/car-model.js');
const UserModel = require('../models/user-model.js');


router.get('/new-car', (req, res, next) => {
  res.render('new-car-view.ejs');
});

router.post('/new-car', (req, res, next) => {
  const newCar = new CarModel({
    make:  req.body.vehicleMake,
    model: req.body.vehicleModel,
    year:  req.body.vehicleYear,
    mpg:   req.body.vehicleMPG,
    desc:  req.body.vehicleDesc,
    owner: req.user.userName
  });
  // 1ST step: find the user in DB
  UserModel.findById(
    req.user._id,
    (err, userFromDb) => {
      if(err) return void next(err);

     console.log('----------------userFromDb--------------');
     console.log(userFromDb);
     //2nd add new car to his inventory
     userFromDb.cars.push(newCar);
     //3rd save changes
     userFromDb.save((err) => {
       if(err) return void next(err);
       res.redirect('/profile');
     });
});
  });

router.get('/profile', (req, res, next) => {
  res.render('user-profile.ejs');
});
// find and splice from array this way or findByIdAndRemove from cars collection
// and simply update user ???
router.post('/:carId/delete', (req, res, next) => {
  const carToRemoveId = req.params.carId;
  // console.log('---------CAR TO REMOVE: ' + carToRemoveId);
  UserModel.findOne(
    req.user._id,
    (err, userFromDb) => {
      if (err) return void next(err);
      userFromDb.cars.forEach((oneCar, index) => {
        // console.log('----------CAR FROM DB: ' + oneCar._id);
        // console.log('-----------ID FILE TYPE: '+ typeof oneCar._id);
        //why oneCar and carToRemoveId are different types ???
        if (oneCar._id.toString() === carToRemoveId.toString()) {
          // console.log('-----------IF STATEMENT TRIGGERED');
          userFromDb.cars.splice(index, 1); 
        }
        // console.log("----------CARS ARRAY: " + userFromDb.cars);
      });
      userFromDb.save((err) => {
        if(err) return void next(err);
        res.redirect('/profile');
      });
    }
  );
});


module.exports = router;
