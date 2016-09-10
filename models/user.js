var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({

  name: String,
  checkedIn: Boolean,
  checkedOut: Boolean,
  tours: Number,
  desk: Number,
  phone: String,
  bannerId: String,
  updated: {
    type: Date,
    default: Date.now
  }
});


// make this available to our users in our Node applications
module.exports = mongoose.model('User', userSchema);
