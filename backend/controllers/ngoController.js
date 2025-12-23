const Donation = require('../models/Donation');
const User = require('../models/User');


exports.getNGOAnalytics = async (req, res) => {
  try {
    const ngoId = req.user.id;

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Received (all time - Picked Up status)
    const totalReceived = await Donation.countDocuments({
      ngo: ngoId,
      status: 'Picked Up'
    });

    // Total Received Last Month (for comparison)
    const totalReceivedLastMonth = await Donation. countDocuments({
      ngo: ngoId,
      status: 'Picked Up',
      pickedUpAt: {
        $gte:  startOfLastMonth,
        $lte: endOfLastMonth
      }
    });

    // Calculate percentage change for Total Received
    const totalReceivedChange = totalReceivedLastMonth > 0 
      ? Math.round(((totalReceived - totalReceivedLastMonth) / totalReceivedLastMonth) * 100)
      : 0;

    // People Fed (all time - based on quantity of picked up donations)
    const donations = await Donation.find({
      ngo: ngoId,
      status: 'Picked Up'
    }).select('quantity');

    // Calculate people fed based on quantity
    let peopleFed = 0;
    donations.forEach(donation => {
      // Extract number from quantity string (e.g., "50 meals" -> 50)
      const match = donation.quantity.match(/\d+/);
      if (match) {
        const num = parseInt(match[0]);
        // Estimate:  1 meal = 1 person, 1 kg = 3 people, 1 item = 1 person
        if (donation.quantity.includes('meal')) {
          peopleFed += num;
        } else if (donation. quantity.includes('kg')) {
          peopleFed += num * 3;
        } else {
          peopleFed += num;
        }
      }
    });

    // People Fed Last Month
    const donationsLastMonth = await Donation. find({
      ngo: ngoId,
      status: 'Picked Up',
      pickedUpAt: {
        $gte: startOfLastMonth,
        $lte:  endOfLastMonth
      }
    }).select('quantity');

    let peopleFedLastMonth = 0;
    donationsLastMonth.forEach(donation => {
      const match = donation.quantity.match(/\d+/);
      if (match) {
        const num = parseInt(match[0]);
        if (donation.quantity.includes('meal')) {
          peopleFedLastMonth += num;
        } else if (donation.quantity.includes('kg')) {
          peopleFedLastMonth += num * 3;
        } else {
          peopleFedLastMonth += num;
        }
      }
    });

    const peopleFedChange = peopleFedLastMonth > 0
      ? Math.round(((peopleFed - peopleFedLastMonth) / peopleFedLastMonth) * 100)
      : 0;

    // Active Acceptances (Accepted status - pending pickup)
    const activeAcceptances = await Donation.countDocuments({
      ngo: ngoId,
      status: 'Accepted'
    });

    // Active Acceptances Last Month
    const activeAcceptancesLastMonth = await Donation.countDocuments({
      ngo: ngoId,
      status: 'Accepted',
      acceptedAt: {
        $gte: startOfLastMonth,
        $lte:  endOfLastMonth
      }
    });

    const activeAcceptancesChange = activeAcceptancesLastMonth > 0
      ? Math.round(((activeAcceptances - activeAcceptancesLastMonth) / activeAcceptancesLastMonth) * 100)
      : 0;

    // This Month (donations picked up this month)
    const thisMonth = await Donation.countDocuments({
      ngo: ngoId,
      status: 'Picked Up',
      pickedUpAt: { $gte: startOfMonth }
    });

    // Last Month total
    const lastMonthTotal = await Donation.countDocuments({
      ngo: ngoId,
      status: 'Picked Up',
      pickedUpAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    });

    const thisMonthChange = lastMonthTotal > 0
      ? Math. round(((thisMonth - lastMonthTotal) / lastMonthTotal) * 100)
      : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalReceived:  {
          count: totalReceived,
          change: totalReceivedChange
        },
        peopleFed: {
          count: peopleFed,
          change: peopleFedChange
        },
        activeAcceptances: {
          count: activeAcceptances,
          change: activeAcceptancesChange
        },
        thisMonth: {
          count: thisMonth,
          change: thisMonthChange
        }
      }
    });

  } catch (error) {
    console.error('❌ NGO Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};