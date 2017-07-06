const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TripModel = new Schema ({
  origin:      {type: String},
  destination: {type: String},
  distance:    {type: Number},
  gas:         {type: String},
  cost:        {type: String},
  image:       {type: String, default: "../images/family-road-trip.jpg"}
});

const Trip = mongoose.model('Trip', TripModel);

module.exports = Trip;
