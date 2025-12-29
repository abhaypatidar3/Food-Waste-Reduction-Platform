const Donation = require('../models/Donation');
const User = require('../models/User');


exports.getNGOAnalytics = async (req, res) => {
  try {

    const ngoId = req.user._id; // Changed from req.user.id to req.user._id
    console.log('📊 Fetching analytics for NGO:', ngoId);

   

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Received (all time - Picked Up status)
    const totalReceived = await Donation.countDocuments({
      acceptedBy: ngoId,
      status: 'Picked Up'
    });

    console.log(' Total Received:', totalReceived);

    // Total Received Last Month
    const totalReceivedLastMonth = await Donation.countDocuments({
      acceptedBy: ngoId,
      status: 'Picked Up',
      pickedUpAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    });

    // Calculate percentage change
    const totalReceivedChange = totalReceivedLastMonth > 0 
      ? Math.round(((totalReceived - totalReceivedLastMonth) / totalReceivedLastMonth) * 100)
      : totalReceived > 0 ?  100 : 0;

    //People Fed (estimate based on quantity)
    const donations = await Donation.find({
      acceptedBy: ngoId,
      status: 'Picked Up'
    }).select('quantity');

    let peopleFed = 0;
    donations.forEach(donation => {
      const match = donation.quantity.match(/\d+/);
      if (match) {
        const num = parseInt(match[0]);
        if (donation.quantity. toLowerCase().includes('meal')) {
          peopleFed += num; //1 meal = 1 person
        } else if (donation.quantity.toLowerCase().includes('kg')) {
          peopleFed += num * 3; //1 kg = 3 persons
        } else if (donation.quantity.toLowerCase().includes('item')) {
          peopleFed += num; //1 item = 1 person
        } else {
          peopleFed += num; // anything other means 1 people fed
        }
      }
    });

    console.log(' People Fed:', peopleFed);

    // People Fed Last Month
    const donationsLastMonth = await Donation.find({
      acceptedBy:  ngoId,
      status:  'Picked Up',
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
        if (donation.quantity.toLowerCase().includes('meal')) {
          peopleFedLastMonth += num;
        } else if (donation.quantity.toLowerCase().includes('kg')) {
          peopleFedLastMonth += num * 3;
        } else {
          peopleFedLastMonth += num;
        }
      }
    });

    const peopleFedChange = peopleFedLastMonth > 0
      ? Math.round(((peopleFed - peopleFedLastMonth) / peopleFedLastMonth) * 100)
      : peopleFed > 0 ? 100 : 0;

    // Active Acceptances (Accepted status - pending pickup)
    const activeAcceptances = await Donation.countDocuments({
      acceptedBy: ngoId,
      status: 'Accepted'
    });

    console.log(' Active Acceptances:', activeAcceptances);

    // Active Acceptances Last Month
    const activeAcceptancesLastMonth = await Donation.countDocuments({
      acceptedBy:  ngoId,
      status:  'Accepted',
      acceptedAt: {
        $gte: startOfLastMonth,
        $lte:  endOfLastMonth
      }
    });

    const activeAcceptancesChange = activeAcceptancesLastMonth > 0
      ? Math.round(((activeAcceptances - activeAcceptancesLastMonth) / activeAcceptancesLastMonth) * 100)
      : activeAcceptances > 0 ? 100 : 0;

    // This Month (donations picked up this month)
    const thisMonth = await Donation.countDocuments({
      acceptedBy: ngoId,
      status: 'Picked Up',
      pickedUpAt: { $gte: startOfMonth }
    });

    console.log(' This Month:', thisMonth);

    // Last Month total
    const lastMonthTotal = await Donation.countDocuments({
      acceptedBy: ngoId,
      status: 'Picked Up',
      pickedUpAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    });

    const thisMonthChange = lastMonthTotal > 0
      ? Math. round(((thisMonth - lastMonthTotal) / lastMonthTotal) * 100)
      : thisMonth > 0 ? 100 : 0;

    const analytics = {
      totalReceived:  {
        count: totalReceived,
        change: totalReceivedChange
      },
      peopleFed:  {
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
    };

    console.log(' Final Analytics:', analytics);

    res.status(200).json({
      success: true,
      analytics
    });

  }catch (error) {
    console.error(' NGO Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// module.exports = {
//   getNGOAnalytics
// };