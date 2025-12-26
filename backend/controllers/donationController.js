const Donation = require('../models/Donation');
const User = require('../models/User');
const { notifyNearbyNGOs, notifyRestaurantAcceptance, notifyDonationCompleted } = require('../utils/notificationHelper');

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Restaurant)
exports.createDonation = async (req, res, next) => {
  try {
    const donation = await Donation.create({
      ... req.body,
      restaurant: req.user._id
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate('restaurant', 'organizationName phone email');

    // 🔔 Notify nearby NGOs about new donation
    await notifyNearbyNGOs(populatedDonation);

    res.status(201).json({
      success: true,
      data: populatedDonation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Get all donations (with filters)
// @route   GET /api/donations
// @access  Private
exports.getAllDonations = async (req, res, next) => {
  try {
    const { status, category, isActive } = req.query;
    
    let query = {};
    
    // If user is NGO, show their accepted donations
    if (req.user.role === 'ngo') {
      query.acceptedBy = req.user._id;
    }
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive;

    const donations = await Donation. find(query)
      .populate('restaurant', 'organizationName email phone address')
      .populate('acceptedBy', 'organizationName email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count:  donations.length,
      data: donations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
exports. getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req. params.id)
      .populate('restaurant', 'organizationName email phone address')
      .populate('acceptedBy', 'organizationName email phone');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my donations (restaurant)
// @route   GET /api/donations/my-donations
// @access  Private (Restaurant)
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ restaurant: req.user._id })
      .populate('acceptedBy', 'organizationName email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: donations. length,
      data: donations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error. message
    });
  }
};

// @desc    Update donation
// @route   PATCH /api/donations/:id
// @access  Private (Restaurant - own donations only)
exports.updateDonation = async (req, res, next) => {
  try {
    let donation = await Donation.findById(req.params. id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check ownership
    if (donation.restaurant. toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    // Don't allow updates if already accepted
    if (donation. status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update donation that has been accepted'
      });
    }

    donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private (Restaurant - own donations only)
exports.deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check ownership
    if (donation.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this donation'
      });
    }

    await donation. deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept donation (NGO)
// @route   PATCH /api/donations/:id/accept
// @access  Private (NGO)
exports.acceptDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('restaurant', 'organizationName');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.status !== 'Pending') {
      return res. status(400).json({
        success: false,
        message:  'Donation is no longer available'
      });
    }

    donation.status = 'Accepted';
    donation.acceptedBy = req.user._id;
    donation.acceptedAt = new Date();

    await donation. save();

    await donation.populate('acceptedBy', 'organizationName email phone');

    // 🔔 Notify restaurant about acceptance
    const NGO = require('../models/NGO');
    const ngo = await NGO.findById(req.user._id);
    await notifyRestaurantAcceptance(donation.restaurant._id, donation, ngo);

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark donation as picked up
// @route   PATCH /api/donations/: id/picked-up
// @access  Private (NGO)
exports.markAsPickedUp = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('restaurant', 'organizationName');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.acceptedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    if (donation. status !== 'Accepted') {
      return res.status(400).json({
        success: false,
        message: 'Donation must be accepted first'
      });
    }

    donation. status = 'Picked Up';
    donation.pickedUpAt = new Date();
    donation.isActive = false;

    await donation.save();

    // Calculate people fed
    const match = donation.quantity.match(/\d+/);
    let peopleFed = 30; // default
    if (match) {
      const num = parseInt(match[0]);
      if (donation.quantity.includes('meal')) {
        peopleFed = num;
      } else if (donation.quantity.includes('kg')) {
        peopleFed = num * 3;
      } else {
        peopleFed = num;
      }
    }

    // 🔔 Notify NGO about completion
    await notifyDonationCompleted(req.user._id, donation, peopleFed);

    res.status(200).json({
      success: true,
      data:  donation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:  error.message
    });
  }
};

// @desc    Get nearby donations
// @route   GET /api/donations/nearby
// @access  Private (NGO)
exports.getNearbyDonations = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000, category, status = 'Pending' } = req.query;

    let query = { status, isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    let donations;

    if (lat && lng) {
      // Find donations near the provided coordinates
      donations = await Donation. find({
        ... query,
        'pickupAddress.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance:  parseInt(maxDistance)
          }
        }
      })
        .populate('restaurant', 'organizationName email phone address')
        .sort('-createdAt');
    } else {
      // If no coordinates, return all matching donations
      donations = await Donation.find(query)
        .populate('restaurant', 'organizationName email phone address')
        .sort('-createdAt');
    }

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getDonationStats = async (req, res, next) => {
  try {
    const restaurantId = req.user._id;

    // Current month dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Donations
    const totalDonations = await Donation.countDocuments({ 
      restaurant: restaurantId 
    });

    // Active Donations (Pending or Accepted)
    const activeDonations = await Donation.countDocuments({ 
      restaurant: restaurantId, 
      status: { $in: ['Pending', 'Accepted'] },
      isActive: true
    });

    // Completed Donations
    const completedDonations = await Donation.countDocuments({ 
      restaurant:  restaurantId, 
      status: 'Picked Up' 
    });

    // Get all completed donations to calculate meals and food saved
    const donations = await Donation.find({ 
      restaurant: restaurantId, 
      status: 'Picked Up' 
    }).select('quantity');
    
    // Calculate meals saved and food weight
    let mealsSaved = 0;
    let foodSavedKg = 0;

    donations.forEach(donation => {
      const match = donation.quantity. match(/(\d+\. ?\d*)/);
      if (match) {
        const numericValue = parseFloat(match[1]);
        
        if (donation.quantity.toLowerCase().includes('meal')) {
          mealsSaved += numericValue;
          foodSavedKg += numericValue * 0.3; // Estimate 0.3 kg per meal
        } else if (donation.quantity.toLowerCase().includes('kg')) {
          foodSavedKg += numericValue;
          mealsSaved += numericValue * 3; // Estimate 3 meals per kg
        } else if (donation.quantity.toLowerCase().includes('item')) {
          mealsSaved += numericValue;
          foodSavedKg += numericValue * 0.2; // Estimate 0.2 kg per item
        } else {
          // Default:  treat as items
          mealsSaved += numericValue * 2;
          foodSavedKg += numericValue * 0.3;
        }
      }
    });

    // Calculate percentage changes (compared to last month)
    const lastMonthCompleted = await Donation.countDocuments({
      restaurant: restaurantId,
      status: 'Picked Up',
      pickedUpAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    });

    const thisMonthCompleted = await Donation.countDocuments({
      restaurant: restaurantId,
      status: 'Picked Up',
      pickedUpAt: { $gte: startOfMonth }
    });

    // Calculate percentage changes
    const totalDonationsChange = lastMonthCompleted > 0 
      ? Math.round(((thisMonthCompleted - lastMonthCompleted) / lastMonthCompleted) * 100)
      : thisMonthCompleted > 0 ?  100 : 0;

    // Get last month meals for comparison
    const lastMonthDonations = await Donation.find({
      restaurant: restaurantId,
      status: 'Picked Up',
      pickedUpAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    }).select('quantity');

    let lastMonthMeals = 0;
    let lastMonthFoodKg = 0;

    lastMonthDonations.forEach(donation => {
      const match = donation.quantity.match(/(\d+\.?\d*)/);
      if (match) {
        const numericValue = parseFloat(match[1]);
        if (donation.quantity.toLowerCase().includes('meal')) {
          lastMonthMeals += numericValue;
          lastMonthFoodKg += numericValue * 0.3;
        } else if (donation. quantity.toLowerCase().includes('kg')) {
          lastMonthFoodKg += numericValue;
          lastMonthMeals += numericValue * 3;
        } else {
          lastMonthMeals += numericValue * 2;
          lastMonthFoodKg += numericValue * 0.3;
        }
      }
    });

    const mealsSavedChange = lastMonthMeals > 0
      ? Math.round(((mealsSaved - lastMonthMeals) / lastMonthMeals) * 100)
      : mealsSaved > 0 ? 100 : 0;

    const foodSavedChange = lastMonthFoodKg > 0
      ?  Math.round(((foodSavedKg - lastMonthFoodKg) / lastMonthFoodKg) * 100)
      : foodSavedKg > 0 ? 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDonations,
        totalDonationsChange,
        activeDonations,
        completedDonations,
        mealsSaved:  Math.round(mealsSaved),
        mealsSavedChange,
        foodSavedKg: Math.round(foodSavedKg),
        foodSavedChange
      }
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};