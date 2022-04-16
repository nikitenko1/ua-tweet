const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    username: { type: String, trim: true, unique: true },
    email: { type: String, trim: true },
    phone: { type: String },
    intl: { type: String },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    dob: { type: Date },
    active: { type: Boolean, default: false },
    tokens: { type: Array, default: [], select: false },
    profilePhoto: {
      type: Object,
      default: {
        public_id: '',
        url: 'https://res.cloudinary.com/dvpy1nsjp/image/upload/v1635570881/sample.jpg',
      },
    },
    coverPhoto: { type: Object, default: { public_id: '', url: '' } },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
    retweets: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
    bookmarks: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
    following: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    role: { type: String, default: 'user' },
    registerToken: String,
    registerTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// bcrypt.compare: user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// jwt
userSchema.methods.getSignedJwtToken = function () {
  // 2) Passing only the _id:
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET);
};

// Create register token Math.random() (inclusive of 0, but not 1)
userSchema.methods.getRegisterToken = function () {
  const registerToken = Math.floor(100000 + Math.random() * 900000);

  this.registerToken = registerToken;

  // Set expire to 30 mins
  this.registerTokenExpire = Date.now() + 30 * 60 * 1000;

  return registerToken;
};

// Generate password token
// Create password reset token
userSchema.methods.getResetPasswordToken = function () {
  const passwordResetToken = crypto.randomBytes(4).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(passwordResetToken)
    .digest('hex');

  // Set expire to 30 mins
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return passwordResetToken;
};

const Users = mongoose.model('User', userSchema);
module.exports = { Users };
