const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getNGOAnalytics } = require('../controllers/ngoController');


router.get('/analytics', protect, authorize('ngo'), getNGOAnalytics);

module.exports = router;