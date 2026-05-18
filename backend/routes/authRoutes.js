const express = require('express');
const { body } = require('express-validator');

const validate          = require('../middleware/validate');
const { protect }       = require('../middleware/auth');
const authController    = require('../controllers/authController');

const router = express.Router();

/* ---------- Signup ---------- */
router.post(
  '/signup',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 chars.'),
    body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').isIn(['jobseeker', 'employer']).withMessage('Role must be jobseeker or employer.'),
    body('company').optional().trim().isLength({ max: 120 })
  ],
  validate,
  authController.signup
);

/* ---------- Login ---------- */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
    body('role').optional().isIn(['jobseeker', 'employer', 'admin'])
  ],
  validate,
  authController.login
);

/* ---------- Me ---------- */
router.get('/me', protect, authController.me);

/* ---------- Profile update ---------- */
router.patch('/profile', protect, authController.updateProfile);

module.exports = router;
