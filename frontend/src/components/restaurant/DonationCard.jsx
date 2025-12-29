import { useState } from 'react';
import { deleteDonation } from '../../services/donationService';

const DonationCard = ({ donation, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (! window.confirm('Are you sure you want to delete this donation?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteDonation(donation._id);
      alert('Donation deleted successfully');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete donation');
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
      minute:  '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-gray-100">
        <div>
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

      {/* Body */}
      <div className="space-y-2. 5 mb-4">
        <div className="flex text-sm">
          <span className="font-semibold text-gray-600 min-w-[140px]">Quantity:</span>
          <span className="text-gray-800">{donation.quantity}</span>
        </div>

        <div className="flex text-sm">
          <span className="font-semibold text-gray-600 min-w-[140px]">Expires At:</span>
          <span className="text-gray-800">{formatDate(donation.expiryTime)}</span>
        </div>

        <div className="flex text-sm">
          <span className="font-semibold text-gray-600 min-w-[140px]">Pickup Address:</span>
          <span className="text-gray-800">
            {donation.pickupAddress.street}, {donation.pickupAddress.city}, {donation.pickupAddress.state}
          </span>
        </div>

        {donation.pickupInstructions && (
          <div className="flex text-sm">
            <span className="font-semibold text-gray-600 min-w-[140px]">Instructions:</span>
            <span className="text-gray-800">{donation.pickupInstructions}</span>
          </div>
        )}

        {donation.acceptedBy && (
          <div className="flex text-sm">
            <span className="font-semibold text-gray-600 min-w-[140px]">Accepted By:</span>
            <span className="text-gray-800">{donation.acceptedBy.organizationName}</span>
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

      {/* Actions */}
      {donation.status === 'Pending' && (
        <div className="flex justify-end pt-3 border-t-2 border-gray-100">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationCard;