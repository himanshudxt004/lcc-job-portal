const express = require('express');

const { protect }            = require('../middleware/auth');
const { requireRole }        = require('../middleware/role');
const { uploadResume }       = require('../middleware/upload');
const applicationController  = require('../controllers/applicationController');

const router = express.Router();

/* Apply to a job — jobseeker, optionally with resume file (multipart) */
router.post(
  '/apply',
  protect,
  requireRole('jobseeker'),
  uploadResume.single('resume'),
  applicationController.apply
);

/* Standalone resume upload (jobseeker profile) */
router.post(
  '/auth/resume',
  protect,
  requireRole('jobseeker'),
  uploadResume.single('resume'),
  applicationController.uploadOnly
);

/* My applications — jobseeker */
router.get(
  '/applications/user',
  protect,
  requireRole('jobseeker'),
  applicationController.userApplications
);

/* Applicants on my jobs — employer */
router.get(
  '/applications/employer',
  protect,
  requireRole('employer'),
  applicationController.employerApplications
);

/* Status update — employer */
router.patch(
  '/applications/:id/status',
  protect,
  requireRole('employer'),
  applicationController.updateStatus
);

module.exports = router;
