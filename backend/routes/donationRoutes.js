const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createDonation,
  getAllDonations,
  getDonation,
  updateDonation,
  deleteDonation,
  getMyDonations,
  acceptDonation,
  markAsPickedUp,
  getNearbyDonations,
  getDonationStats
} = require('../controllers/donationController');
const { donationLimiter, acceptDonationLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Restaurant routes
router.post('/', protect, authorize('restaurant'), donationLimiter, createDonation);
router.get('/my-donations', protect, authorize('restaurant'), getMyDonations);
router.get('/stats', protect, authorize('restaurant'), getDonationStats);

// NGO routes
router.get('/nearby', protect, authorize('ngo'), apiLimiter, getNearbyDonations);
router.patch('/:id/accept', protect, authorize('ngo'), acceptDonationLimiter, acceptDonation);
router.patch('/:id/picked-up', protect, authorize('ngo'), markAsPickedUp);

// Common routes
router.get('/', protect, getAllDonations);
router.get('/:id', protect, getDonation);
router.patch('/:id', protect, authorize('restaurant'), updateDonation);
router.delete('/:id', protect, authorize('restaurant'), deleteDonation);

module.exports = router;