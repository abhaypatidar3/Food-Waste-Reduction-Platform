const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getNGOAnalytics } = require('../controllers/ngoController');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/analytics', protect, authorize('ngo'), apiLimiter, getNGOAnalytics);

module.exports = router;