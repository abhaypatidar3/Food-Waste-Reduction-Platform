import { useState } from 'react';
import { acceptDonation, markAsPickedUp } from '../../services/donationService';

const NGODonationCard = ({ donation, onUpdate, showActions = true }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!window.confirm('Do you want to accept this donation?')) {
      return;
    }

    setLoading(true);
    try {
      await acceptDonation(donation._id);
      alert('Donation accepted successfully!');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept donation');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPickedUp = async () => {
    if (!window.confirm('Mark this donation as picked up?')) {
      return;
    }

    setLoading(true);
    try {
      await markAsPickedUp(donation._id);
      alert('Donation marked as picked up!');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update donation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Accepted':
        return 'bg-blue-100 text-blue-700';
      case 'Picked Up':
        return 'bg-green-100 text-green-700';
      case 'Expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month:  'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    return `${hours}h ${minutes}m left`;
  };

  const timeRemaining = getTimeRemaining(donation.expiryTime);
  const isUrgent = timeRemaining. includes('h') || timeRemaining === 'Expired';

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-gray-100">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {donation.foodName}
          </h3>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            {donation.category}
          </span>
        </div>
        <span className={`px-4 py-1. 5 rounded-full text-xs font-bold uppercase ${getStatusStyles(donation.status)}`}>
          {donation.status}
        </span>
      </div>

      {/* Time Remaining Alert */}
      {donation.status === 'Pending' && (
        <div className={`mb-4 p-3 rounded-lg ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm font-semibold ${isUrgent ?  'text-red-700' : 'text-blue-700'}`}>
            ⏰ {timeRemaining}
          </p>
        </div>
      )}

      {/* Body */}
      <div className="space-y-2. 5 mb-4">
        <div className="flex text-sm">
          <span className="font-semibold text-gray-600 min-w-[140px]">Quantity:</span>
          <span className="text-gray-800">{donation.quantity}</span>
        </div>

        <div className="flex text-sm">
          <span className="font-semibold text-gray-600 min-w-[140px]">Restaurant:</span>
          <span className="text-gray-800">{donation.restaurant?. organizationName || donation.restaurant?.name || 'N/A'}</span>
        </div>

        <div className="flex text-sm">
          <span className="font-semibold text-gray-600 min-w-[140px]">Expires At:</span>
          <span className="text-gray-800">{formatDate(donation.expiryTime)}</span>
        </div>

        <div className="flex text-sm">
          <span className="font-semibold text-gray-600 min-w-[140px]">Pickup Address:</span>
          <span className="text-gray-800">
            {donation.pickupAddress. street}, {donation.pickupAddress.city}, {donation.pickupAddress.state}
          </span>
        </div>

        {donation.restaurant?. phone && (
          <div className="flex text-sm">
            <span className="font-semibold text-gray-600 min-w-[140px]">Contact:</span>
            <a href={`tel:${donation.restaurant.phone}`} className="text-blue-600 hover:underline">
              {donation.restaurant.phone}
            </a>
          </div>
        )}

        {donation.pickupInstructions && (
          <div className="flex text-sm">
            <span className="font-semibold text-gray-600 min-w-[140px]">Instructions:</span>
            <span className="text-gray-800">{donation.pickupInstructions}</span>
          </div>
        )}

        {donation.acceptedAt && (
          <div className="flex text-sm">
            <span className="font-semibold text-gray-600 min-w-[140px]">Accepted At:</span>
            <span className="text-gray-800">{formatDate(donation.acceptedAt)}</span>
          </div>
        )}

        {donation.pickedUpAt && (
          <div className="flex text-sm">
            <span className="font-semibold text-gray-600 min-w-[140px]">Picked Up At:</span>
            <span className="text-gray-800">{formatDate(donation. pickedUpAt)}</span>
          </div>
        )}
      </div>

      
      {showActions && (
        <div className="flex gap-2 pt-3 border-t-2 border-gray-100">
          {donation.status === 'Pending' && (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ?  'Accepting...' : 'Accept Donation'}
            </button>
          )}
          
          {donation.status === 'Accepted' && (
            <button
              onClick={handleMarkPickedUp}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Updating...' : 'Mark as Picked Up'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NGODonationCard;