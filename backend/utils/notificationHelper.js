const Notification = require('../models/Notification');

// Create notification
const createNotification = async (recipientId, type, title, message, donationId = null) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedDonation: donationId
    });
    console.log(`✅ Notification created for user ${recipientId}`);
  } catch (error) {
    console.error('❌ Notification creation error:', error);
  }
};

// Notify all nearby NGOs about new donation
const notifyNearbyNGOs = async (donation) => {
  try {
    const NGO = require('../models/NGO');
    
    // Get all active NGOs (you can add distance filtering later)
    const ngos = await NGO.find({ isActive: true, isVerified: true });

    for (const ngo of ngos) {
      await createNotification(
        ngo._id,
        'new_donation',
        'New donation nearby',
        `${donation.restaurant?.organizationName || 'A restaurant'} posted ${donation.foodName} (${donation.quantity}) - ${donation.pickupAddress. city}`,
        donation._id
      );
    }
  } catch (error) {
    console.error('❌ Error notifying NGOs:', error);
  }
};

// Notify about urgent donation (expiring soon)
const notifyUrgentDonation = async (donation) => {
  try {
    const NGO = require('../models/NGO');
    const ngos = await NGO.find({ isActive: true, isVerified: true });

    for (const ngo of ngos) {
      await createNotification(
        ngo._id,
        'urgent',
        'Urgent donation expiring soon',
        `${donation.foodName} from ${donation.restaurant?.organizationName || 'Restaurant'} expires soon - ${donation.pickupAddress.city}`,
        donation._id
      );
    }
  } catch (error) {
    console.error('❌ Error notifying urgent donation:', error);
  }
};

// Notify NGO about pickup reminder
const notifyPickupReminder = async (ngoId, donation) => {
  try {
    const expiryTime = new Date(donation.expiryTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    await createNotification(
      ngoId,
      'reminder',
      'Pickup reminder',
      `Don't forget to pickup ${donation.foodName} from ${donation.restaurant?.organizationName || 'Restaurant'} by ${expiryTime} today`,
      donation._id
    );
  } catch (error) {
    console.error('❌ Error creating pickup reminder:', error);
  }
};

// Notify NGO about completed donation
const notifyDonationCompleted = async (ngoId, donation, peopleFed) => {
  try {
    await createNotification(
      ngoId,
      'completed',
      'Donation completed',
      `Successfully picked up ${donation.foodName} from ${donation.restaurant?.organizationName || 'Restaurant'}.  ${peopleFed} people fed! `,
      donation._id
    );
  } catch (error) {
    console.error('❌ Error creating completion notification:', error);
  }
};

// Notify restaurant about acceptance
const notifyRestaurantAcceptance = async (restaurantId, donation, ngo) => {
  try {
    await createNotification(
      restaurantId,
      'accepted',
      'Donation accepted',
      `${ngo.organizationName} accepted your donation:  ${donation.foodName}`,
      donation._id
    );
  } catch (error) {
    console.error('❌ Error notifying restaurant:', error);
  }
};

module.exports = {
  createNotification,
  notifyNearbyNGOs,
  notifyUrgentDonation,
  notifyPickupReminder,
  notifyDonationCompleted,
  notifyRestaurantAcceptance
};