const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false // do not return by default
    },
    role: {
      type: String,
      enum: ['jobseeker', 'employer'],
      required: [true, 'Role is required']
    },
    // Optional profile fields
    phone:    { type: String, trim: true },
    company:  { type: String, trim: true }, // employers
    headline: { type: String, trim: true }, // jobseeker tagline
    location: { type: String, trim: true },
    skills:   [{ type: String, trim: true }],
    resume:   { type: String, default: '' }  // path to most-recent resume file
  },
  { timestamps: true }
);

// ---------- Pre-save: hash password ----------
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ---------- Instance method: compare password ----------
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ---------- Hide sensitive fields from JSON ----------
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
