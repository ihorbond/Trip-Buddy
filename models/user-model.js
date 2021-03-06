const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserModel = new Schema ({
  fullName:         {type: String},
  userName:         {type: String},
  password:         {type: String},
  securityQuestion: {type: String, required: true, default: "City you were born"},
  securityAnswer:   {type: String},
  facebookId:       {type: String},
  googleId:         {type: String},
  cars:             {type: Array},
  trips:            {type: Array}
});

module.exports = mongoose.model('User', UserModel);
