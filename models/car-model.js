const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CarModel = new Schema ({
  make:  {type: String, required: true},
  model: {type: String, required: true},
  year:  {type: Number},
  mpg:   {type: Number, required: true},
  desc:  {type: String},
  owner: {type: String},
  image: {type: String, default: "../images/car.png"}
});

const Car = mongoose.model('Car', CarModel);

module.exports = Car;
