(function () {
  'use strict';
  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');
  const Schema = mongoose.Schema;
  const userSchema = new Schema({
    email: {
      type: String,
      required: [true, 'Email is Require'],
    },
    password: {
      type: String,
      required: [true, 'Password is Require'],
    },
    name: {
      type: String,
      required: [true, 'Name is Require'],
    }
  });
  userSchema.methods.generateHash = function (password) {
    var hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    this.password = hashPassword;
    return hashPassword;  
  };
  userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };
  const User = mongoose.model('User', userSchema);
  module.exports = User;
})();