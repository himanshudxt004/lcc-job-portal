const express = require('express');
const { body } = require('express-validator');

const validate       = require('../middleware/validate');
const { protect }    = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { uploadBlogImage } = require('../middleware/upload');
const blogController = require('../controllers/blogController');

const router = express.Router();

const blogValidators = [
  body('title').trim().isLength({ min: 3, max: 160 }).withMessage('Title 3-160 chars.'),
  body('content').trim().isLength({ min: 20 }).withMessage('Content min 20 chars.'),
  body('excerpt').optional().trim().isLength({ max: 400 })
];

/* Public */
router.get('/', blogController.list);
router.get('/admin/all', protect, requireRole('admin'), blogController.adminList);
router.get('/admin/:id', protect, requireRole('admin'), blogController.adminGetOne);
router.get('/:slug', blogController.getBySlug);

/* Admin writes — image optional */
router.post(
  '/',
  protect,
  requireRole('admin'),
  (req, res, next) => {
    if (req.is('multipart/form-data')) {
      return uploadBlogImage.single('coverImage')(req, res, next);
    }
    next();
  },
  blogValidators,
  validate,
  blogController.create
);

router.put(
  '/:id',
  protect,
  requireRole('admin'),
  uploadBlogImage.single('coverImage'),
  blogController.update
);

router.delete(
  '/:id',
  protect,
  requireRole('admin'),
  blogController.remove
);

module.exports = router;
