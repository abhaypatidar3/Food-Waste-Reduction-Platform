const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getReports,
  getAdminStats,
  getAllUsers,
  getAllDonations,
  verifyUser,
  toggleUserStatus,
  deleteUser,
  deleteDonation
} = require('../controllers/adminController');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', getAdminStats);
router.get('/reports', getReports);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Donations management
router.get('/donations', getAllDonations);
router.delete('/donations/:id', deleteDonation);

module.exports = router;