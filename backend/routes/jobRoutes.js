const express = require('express');
const { body } = require('express-validator');

const validate        = require('../middleware/validate');
const { protect }     = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const jobController   = require('../controllers/jobController');

const router = express.Router();

const jobValidators = [
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title 2-120 chars.'),
  body('location').trim().notEmpty().withMessage('Location required.'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description min 10 chars.'),
  body('type').optional().isIn(['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Internship']),
  body('salary').optional().trim().isLength({ max: 80 })
];

/* Public */
router.get('/', jobController.list);

/* Admin — must be BEFORE /:id */
router.get('/admin/all', protect, requireRole('admin'), jobController.adminList);

router.get('/employer/mine', protect, requireRole('employer'), jobController.mine);

router.get('/:id', jobController.getOne);

/* Admin writes */
router.post(
  '/',
  protect,
  requireRole('admin'),
  jobValidators,
  validate,
  jobController.create
);

router.put(
  '/:id',
  protect,
  requireRole('admin'),
  jobController.update
);

router.delete(
  '/:id',
  protect,
  requireRole('admin'),
  jobController.remove
);

module.exports = router;
