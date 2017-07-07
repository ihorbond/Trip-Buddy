const express = require('express');
const router  = express.Router();
const CarModel  = require('../models/car-model.js');
const UserModel = require('../models/user-model.js');
const TripModel = require('../models/trip-model.js');

//is there anyway to put user profile checking inside the function ????
router.get('/profile', (req, res, next) => {
  if(!req.user) res.redirect('/');
  res.render('user-profile.ejs');
});

router.get('/new-car', (req, res, next) => {
  if(!req.user) res.redirect('/');
    res.render('new-car-view.ejs');
  });

// save trip to DB
  router.post("/new-trip-save", (req, res, next) => {
    const newTrip = new TripModel ({
      origin:      req.body.origin,
      destination: req.body.destination,
      distance:    req.body.distance,
      gas:         req.body.gas,
      cost:        req.body.cost,
      traveler:    req.user.userName
    });
    UserModel.findById(
      req.user._id,
      (err, userFromDb) => {
        if(err) return void next(err);
       userFromDb.trips.push(newTrip);
       userFromDb.save((err) => {
         if(err) return void next(err);
         res.redirect('/profile');
       });
  });
  });

  //remove trip
  router.post('/:tripId/delete-trip', (req, res, next) => {
    const tripToRemoveId = req.params.tripId;
    UserModel.findOne(
      req.user._id,
      (err, userFromDb) => {
        if (err) return void next(err);
        userFromDb.trips.forEach((oneTrip, index) => {
          if (oneTrip._id.toString() === tripToRemoveId.toString()) {
            userFromDb.trips.splice(index, 1);
          }
        });
        userFromDb.save((err) => {
          if(err) return void next(err);
          res.redirect('/profile');
        });
      }
    );
  });

  //add car
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

      //  console.log('----------------userFromDb--------------');
       console.log(userFromDb);
       //2nd add new car to his inventory
       if (!newCar.model || !newCar.make || !newCar.mpg) {
        //  console.log("--------EMPTY FILEDS DETECTED");
         res.render('new-car-view.ejs', {error: "Pls make sure to fill out required fileds!"});
         return;
       }
       userFromDb.cars.push(newCar);
       //3rd save changes
       userFromDb.save((err) => {
         if(err) return void next(err);
         res.redirect('/profile');
       });
  });
    });

//remove car
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

//update car
router.get('/:carId/update', (req, res, next) => {
    const carToEditId = req.params.carId;
    UserModel.findById(
      req.user._id,
      (err, userFromDb) => {
        if (err) return void next(err);
        res.render("edit-car-view.ejs", {carId: carToEditId});
      }
    );
});

router.post('/:carId/update', (req, res, next) => {
   const carToEditId = req.params.carId;
  const editedCar = {
      make:  req.body.vehicleMake,
      model: req.body.vehicleModel,
      year:  req.body.vehicleYear,
      mpg:   req.body.vehicleMPG,
      desc:  req.body.vehicleDesc,
  };
     UserModel.findById(
       req.user._id,
       (err, userFromDb) => {
         if (err) return void next (err);
         if (!editedCar.model || !editedCar.make || !editedCar.mpg) {
           res.render('edit-car-view.ejs', {error: "Pls make sure to fill out required fileds"});
           return;
         }
         userFromDb.cars.forEach((oneCar, index) => {
           console.log("ONE CAR ID: " + oneCar._id);
             console.log("editedCarId " + carToEditId);
           if (oneCar._id.toString() === carToEditId.toString()) {
             console.log("TRIGGERED LOOP");
             userFromDb.cars[index].make  = editedCar.make;
             userFromDb.cars[index].model = editedCar.model;
             userFromDb.cars[index].year  = editedCar.year;
             userFromDb.cars[index].mpg   = editedCar.mpg;
             userFromDb.cars[index].desc  = editedCar.desc;
           }
         });
         userFromDb.markModified('cars');
         userFromDb.save((err) => {
           if(err) return void next(err);
         console.log(userFromDb.cars[theIndex]);
           res.redirect('/profile');
             });
       }
     );
});

module.exports = router;
