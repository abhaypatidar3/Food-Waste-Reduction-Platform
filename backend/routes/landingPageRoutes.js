const express = require('express');
const router = express.Router();
const {lpAnalytics} = require('../controllers/landingPageController');

router.get('/analytics',lpAnalytics);

module.exports = router;