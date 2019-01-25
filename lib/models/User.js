const mongoose = require('mongoose'); //import mongoose
const { hash, compare } = require('../utils/hash');
const { untokenize, tokenize } = require('../../lib/utils/token');

const userSchema = new mongoose.Schema ({ //creating user schema to the new 
  
  email: {
    type: String,
    required: true, //[true, 'Email require'] 
    unique: true
  }, 
  passwordHash: String,
  }, {
    toJSON: { //custom toJSON path to remove version and path?
      transform: function (doc, ret) { //return and doc
        delete ret.__v;
        delete ret.passwordHash;
      }
    }  

});

userSchema.virtual('password').set(function(password) { //creates a virtual key called password. this is the key to password in user.test. 
  this._tempPassword = password; //if use a function it refers to the this of wherever it's set. creating a new poperty to store 
});

userSchema.pre('save', function(next) { //middelware-hashes before saving
  hash(this._tempPassword)
    .then(hashedPassword => {
      this.passwordHash = hashedPassword;
      next();
    });
});


userSchema.methods.compare = function(password) {
  return compare(password, this.passwordHash); //user create is saved and get password hash with the this.passwordHash
};

userSchema.methods.authToken = function () {
  return tokenize(this.toJSON());
};

userSchema.statics.findByToken = function(token) {
  //return user
  return untokenize(token); 
}

module.exports = mongoose.model('User', userSchema); //tocreate our model