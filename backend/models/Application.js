const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resume: {
      type: String, // relative URL path, e.g. "/uploads/123_resume.pdf"
      default: ''
    },
    coverNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// One application per user per job
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
