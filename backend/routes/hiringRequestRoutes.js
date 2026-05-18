const express = require('express');
const { body } = require('express-validator');

const validate              = require('../middleware/validate');
const { protect }           = require('../middleware/auth');
const { requireRole }       = require('../middleware/role');
const hiringRequestController = require('../controllers/hiringRequestController');

const router = express.Router();

const createValidators = [
  body('companyName').trim().isLength({ min: 2, max: 120 }).withMessage('Company name required.'),
  body('contactName').trim().isLength({ min: 2, max: 80 }).withMessage('Contact name required.'),
  body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('type').optional().isIn(['hiring', 'consultation'])
];

/* Public or employer-authenticated submit */
router.post(
  '/',
  (req, res, next) => {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      return protect(req, res, next);
    }
    next();
  },
  createValidators,
  validate,
  hiringRequestController.create
);

router.get(
  '/mine',
  protect,
  requireRole('employer'),
  hiringRequestController.mine
);

router.get(
  '/',
  protect,
  requireRole('admin'),
  hiringRequestController.list
);

router.patch(
  '/:id/status',
  protect,
  requireRole('admin'),
  [
    body('status').isIn(['new', 'contacted', 'in_progress', 'closed'])
  ],
  validate,
  hiringRequestController.updateStatus
);

module.exports = router;
