const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Restaurant)
exports.createDonation = async (req, res, next) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      restaurant: req.user._id
    });

    res.status(201).json({
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

// @desc    Get all donations (with filters)
// @route   GET /api/donations
// @access  Private
exports.getAllDonations = async (req, res, next) => {
  try {
    const { status, category, isActive } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive;

    const donations = await Donation. find(query)
      .populate('restaurant', 'name email phone address')
      .populate('acceptedBy', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count:  donations.length,
      data: donations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
exports.getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params. id)
      .populate('restaurant', 'name email phone address')
      .populate('acceptedBy', 'name email phone');

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
      .populate('acceptedBy', 'name email phone')
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
    let donation = await Donation.findById(req.params.id);

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
    if (donation.status !== 'Pending') {
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
      message: error. message
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

    await donation.deleteOne();

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
    const donation = await Donation.findById(req.params.id);

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
    donation.acceptedBy = req. user._id;
    donation. acceptedAt = new Date();

    await donation.save();

    await donation.populate('restaurant', 'name email phone address');
    await donation.populate('acceptedBy', 'name email phone');

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
// @route   PATCH /api/donations/:id/picked-up
// @access  Private (NGO)
exports.markAsPickedUp = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.acceptedBy. toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    if (donation.status !== 'Accepted') {
      return res. status(400).json({
        success: false,
        message:  'Donation must be accepted first'
      });
    }

    donation.status = 'Picked Up';
    donation.pickedUpAt = new Date();
    donation.isActive = false;

    await donation.save();

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

// @desc    Get nearby donations
// @route   GET /api/donations/nearby
// @access  Private (NGO)
exports.getNearbyDonations = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance = 10000, category, status = 'Pending' } = req.query;

    let query = { status, isActive: true };

    if (category) {
      query.category = category;
    }

    let donations;

    if (lat && lng) {
      // Find donations near the provided coordinates
      donations = await Donation.find({
        ... query,
        'pickupAddress.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(maxDistance)
          }
        }
      })
        .populate('restaurant', 'name email phone address')
        .sort('-createdAt');
    } else {
      // If no coordinates, return all matching donations
      donations = await Donation.find(query)
        .populate('restaurant', 'name email phone address')
        .sort('-createdAt');
    }

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

// @desc    Get donation stats (restaurant)
// @route   GET /api/donations/stats
// @access  Private (Restaurant)
exports.getDonationStats = async (req, res, next) => {
  try {
    const totalDonations = await Donation. countDocuments({ restaurant: req. user._id });
    const activeDonations = await Donation. countDocuments({ 
      restaurant: req.user._id, 
      status: 'Pending' 
    });
    const completedDonations = await Donation.countDocuments({ 
      restaurant: req.user._id, 
      status: 'Picked Up' 
    });

    // Get total quantity donated
    const donations = await Donation.find({ 
      restaurant: req.user._id, 
      status: 'Picked Up' 
    });
    
    // Extract numeric values from quantity strings (e.g., "5 kg" -> 5)
    let estimatedMeals = 0;
    donations.forEach(donation => {
      const match = donation.quantity.match(/(\d+\. ?\d*)/);
      if (match) {
        const numericValue = parseFloat(match[1]);
        // Simple estimation: assume each donation serves ~4 meals on average
        estimatedMeals += numericValue * 4;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDonations,
        activeDonations,
        completedDonations,
        mealsSaved: Math.round(estimatedMeals)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};