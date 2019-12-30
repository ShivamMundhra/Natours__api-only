const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true
    // maxlength: [40, 'A user name must be less than 40 characters'],
    // minlength: [10, 'A user name must be more than 10 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password are not same'
    }
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['guide', 'lead-guide', 'user', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 2000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
//INSTANCE METHODS
userSchema.methods.correctPassword = async function(
  candidatepPassword,
  userPassword
) {
  return await bcrypt.compare(candidatepPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTIssueTimeStamp) {
  if (this.passwordChangedAt) {
    const changedPasswordTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTIssueTimeStamp < changedPasswordTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
