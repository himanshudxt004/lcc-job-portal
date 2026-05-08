const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 120
    },
    salary: {
      type: String, // string to allow ranges like "5-8 LPA"
      trim: true,
      default: 'Not disclosed'
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Useful auxiliary fields
    type: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Internship'],
      default: 'Full-Time'
    },
    industry: {
      type: String,
      trim: true,
      default: 'General'
    },
    experience: {
      type: String, // e.g., "0-2 years"
      trim: true,
      default: 'Any'
    },
    skills: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Lightweight text index for search
jobSchema.index({ title: 'text', company: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
