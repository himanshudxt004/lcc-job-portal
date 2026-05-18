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

/* All applicants — admin */
router.get(
  '/applications/admin',
  protect,
  requireRole('admin'),
  applicationController.adminApplications
);

/* Status update — admin */
router.patch(
  '/applications/:id/status',
  protect,
  requireRole('admin'),
  applicationController.updateStatus
);

module.exports = router;
