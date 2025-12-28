const Donation = require('../models/Donation');
const User = require('../models/User');

exports.lpAnalytics = async (req, res) => {
    try{
        const totalNGOs = await User.countDocuments({ role: 'ngo' });

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
            let totalfoodServed = totalPeopleFed/3;
            totalfoodServed = Math.ceil(totalfoodServed * 100) / 100;
    
        const analytics = {
            totalNGOs: totalNGOs,
            totalPeopleFed: totalPeopleFed,
            totalfoodServed: totalfoodServed
        };

        console.log('📊 Landing Page Analytics:', analytics);
        res.status(200).json({
          success: true,
          analytics
        });
    }catch (error) {
        console.error('❌ Landing Page Analytics error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
        });
    }
}