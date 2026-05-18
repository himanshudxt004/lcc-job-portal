const mongoose = require('mongoose');

const hiringRequestSchema = new mongoose.Schema(
  {
    companyName:  { type: String, required: true, trim: true, maxlength: 120 },
    contactName:  { type: String, required: true, trim: true, maxlength: 80 },
    email:        { type: String, required: true, trim: true, lowercase: true },
    phone:        { type: String, trim: true, default: '' },
    rolesNeeded:  { type: String, trim: true, default: '' },
    headcount:    { type: String, trim: true, default: '' },
    industry:     { type: String, trim: true, default: '' },
    location:     { type: String, trim: true, default: '' },
    budget:       { type: String, trim: true, default: '' },
    message:      { type: String, trim: true, maxlength: 3000, default: '' },
    type: {
      type: String,
      enum: ['hiring', 'consultation'],
      default: 'hiring'
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'closed'],
      default: 'new'
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HiringRequest', hiringRequestSchema);
