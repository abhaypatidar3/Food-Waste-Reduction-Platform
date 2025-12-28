const User = require('../models/User');
const Donation = require('../models/Donation');
const Restaurant = require('../models/Restaurant');
const NGO = require('../models/NGO');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin stats...');

    // User statistics
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await User.countDocuments({ role: 'restaurant' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Donation statistics
    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: 'Pending' });
    const acceptedDonations = await Donation.countDocuments({ status: 'Accepted' });
    const completedDonations = await Donation.countDocuments({ status: 'Picked Up' });

    // Calculate people fed (estimated)
    const completedDonationsList = await Donation.find({ status: 'Picked Up' }).select('quantity');
    let totalPeopleFed = 0;
    completedDonationsList.forEach(donation => {
      const match = donation.quantity.match(/\d+/);
      if (match) {
        const num = parseInt(match[0]);
        if (donation.quantity.toLowerCase().includes('meal')) {
          totalPeopleFed += num; // 1 meal = 1 person
        } else if (donation.quantity.toLowerCase().includes('kg')) {
          totalPeopleFed += num*3; // 1 kg = 3 person
        } else {
          totalPeopleFed += num; // anything else means 1 person
        }
      }
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const donationsLastMonth = await Donation.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Category breakdown
    const donationsByCategory = await Donation. aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort:  { count: -1 }
      }
    ]);

    // Monthly donations trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyDonations = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group:  {
          _id: {
            year: { $year:  '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          restaurants: totalRestaurants,
          ngos: totalNGOs,
          verified: verifiedUsers,
          unverified: unverifiedUsers,
          newLastMonth: newUsersLastMonth
        },
        donations: {
          total: totalDonations,
          pending: pendingDonations,
          accepted: acceptedDonations,
          completed:  completedDonations,
          lastMonth: donationsLastMonth
        },
        impact: {
          peopleFed: totalPeopleFed,
          foodSaved: `${completedDonations} donations`
        },
        categories: donationsByCategory,
        trends: {
          monthly: monthlyDonations
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    let query = {};

    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Filter by verification status
    if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'unverified') {
      query.isVerified = false;
    }

    // Search by email or organization name
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User. find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all donations with pagination
// @route   GET /api/admin/donations
// @access  Private (Admin only)
exports.getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const donations = await Donation.find(query)
      .populate('restaurant', 'organizationName email phone')
      .populate('acceptedBy', 'organizationName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      donations,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalDonations: count
    });
  } catch (error) {
    console.error('❌ Get donations error:', error);
    res.status(500).json({
      success: false,
      message:  'Server error'
    });
  }
};

// @desc    Verify user (approve registration)
// @route   PUT /api/admin/users/: id/verify
// @access  Private (Admin only)
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message:  'User verified successfully',
      user: {
        id: user._id,
        email: user.email,
        organizationName: user.organizationName,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Deactivate/Activate user
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deactivating other admins
    if (user.role === 'admin' && user._id. toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate other admin accounts'
      });
    }

  const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !user.isActive },
      { new: true, runValidators: false }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        organizationName: updatedUser.organizationName,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('❌ Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req. params.id);

    if (!user) {
      return res. status(404).json({
        success: false,
        message:  'User not found'
      });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete donation
// @route   DELETE /api/admin/donations/:id
// @access  Private (Admin only)
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    await donation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// module.exports = {
//   getAdminStats,
//   getAllUsers,
//   getAllDonations,
//   verifyUser,
//   toggleUserStatus,
//   deleteUser,
//   deleteDonation
// };