const express = require('express');

const { protect }     = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', protect, requireRole('admin'), adminController.stats);

module.exports = router;
