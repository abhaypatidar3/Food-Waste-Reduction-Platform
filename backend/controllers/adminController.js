const User = require('../models/User');
const Donation = require('../models/Donation');
const Restaurant = require('../models/Restaurant');
const NGO = require('../models/NGO');
const Admin = require('../models/Admin');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res) => {
  try {
    console.log(' Fetching admin stats...');

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
    console.error(' Admin stats error:', error);
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
    console.error(' Get users error:', error);
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
    console.error(' Get donations error:', error);
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
    console.error(' Verify user error:', error);
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
    console.error(' Toggle user status error:', error);
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
    console.error(' Delete user error:', error);
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
    console.error(' Delete donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



exports.getReports = async (req, res) => {
  try {
    // 1. USER STATISTICS
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalNGOs = await NGO.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    // Verified vs Unverified
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Active vs Inactive
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User. countDocuments({ isActive: false });

    // 2. TIME-BASED ANALYTICS
    const now = new Date();
    
    // Today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const usersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });

    // This Week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const usersThisWeek = await User. countDocuments({ createdAt:  { $gte: startOfWeek } });

    // This Month
    const startOfMonth = new Date(now. getFullYear(), now.getMonth(), 1);
    const usersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Last 30 Days Growth
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const userGrowthData = await User.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } }
      },
      {
        $group: {
          _id: { $dateToString: { format:  "%Y-%m-%d", date:  "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // 3. ROLE DISTRIBUTION
    const roleDistribution = [
      { role: 'Restaurant', count: totalRestaurants, percentage: ((totalRestaurants / totalUsers) * 100).toFixed(1) },
      { role: 'NGO', count: totalNGOs, percentage: ((totalNGOs / totalUsers) * 100).toFixed(1) },
      { role: 'Admin', count: totalAdmins, percentage: ((totalAdmins / totalUsers) * 100).toFixed(1) }
    ];

    // 4. VERIFICATION STATUS BY ROLE
    const restaurantVerified = await Restaurant.countDocuments({ isVerified: true });
    const restaurantUnverified = await Restaurant. countDocuments({ isVerified:  false });
    const ngoVerified = await NGO.countDocuments({ isVerified: true });
    const ngoUnverified = await NGO.countDocuments({ isVerified: false });

    const verificationByRole = {
      restaurants: {
        total: totalRestaurants,
        verified:  restaurantVerified,
        unverified: restaurantUnverified,
        verificationRate: totalRestaurants > 0 ?  ((restaurantVerified / totalRestaurants) * 100).toFixed(1) : 0
      },
      ngos: {
        total: totalNGOs,
        verified:  ngoVerified,
        unverified: ngoUnverified,
        verificationRate: totalNGOs > 0 ?  ((ngoVerified / totalNGOs) * 100).toFixed(1) : 0
      }
    };

    // 5. RECENT ACTIVITY
    const recentUsers = await User.find()
      .select('email role isVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get full details
    const recentUsersWithDetails = await Promise.all(
      recentUsers.map(async (user) => {
        let fullUser;
        if (user.role === 'restaurant') {
          fullUser = await Restaurant.findById(user._id);
        } else if (user. role === 'ngo') {
          fullUser = await NGO.findById(user._id);
        } else {
          fullUser = await Admin.findById(user._id);
        }
        return {
          id: fullUser._id,
          name: fullUser.organizationName || fullUser.fullName || 'N/A',
          email: fullUser.email,
          role: fullUser.role,
          isVerified: fullUser. isVerified,
          createdAt: fullUser.createdAt
        };
      })
    );

    // 6. MONTHLY REGISTRATION TRENDS (Last 6 months)
    const last6Months = new Date();
    last6Months.setMonth(last6Months.getMonth() - 6);

    const monthlyTrends = await User.aggregate([
      {
        $match:  { createdAt: { $gte: last6Months } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count:  { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format monthly trends
    const monthlyTrendsFormatted = monthlyTrends.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count
    }));

    // 7. USER STATUS OVERVIEW
    const statusOverview = [
      { status: 'Active & Verified', count: await User.countDocuments({ isActive: true, isVerified: true }) },
      { status: 'Active & Unverified', count: await User.countDocuments({ isActive: true, isVerified: false }) },
      { status: 'Inactive & Verified', count: await User. countDocuments({ isActive: false, isVerified: true }) },
      { status: 'Inactive & Unverified', count: await User.countDocuments({ isActive: false, isVerified: false }) }
    ];

    // Compile all reports
    const reports = {
      overview: {
        totalUsers,
        totalRestaurants,
        totalNGOs,
        totalAdmins,
        verifiedUsers,
        unverifiedUsers,
        activeUsers,
        inactiveUsers,
        verificationRate: ((verifiedUsers / totalUsers) * 100).toFixed(1)
      },
      timeBasedAnalytics: {
        today: usersToday,
        thisWeek: usersThisWeek,
        thisMonth: usersThisMonth,
        dailyGrowth: userGrowthData
      },
      roleDistribution,
      verificationByRole,
      recentActivity:  recentUsersWithDetails,
      monthlyTrends: monthlyTrendsFormatted,
      statusOverview
    };

    res.status(200).json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
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