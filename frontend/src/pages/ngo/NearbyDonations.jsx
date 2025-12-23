import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getNearbyDonations, acceptDonation } from '../../services/donationService';

const NearbyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [filters, setFilters] = useState({
    distance: '5',
    foodType: 'all',
    freshness: 'all'
  });
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await getNearbyDonations({ status: 'Pending' });
      setDonations(response.data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    // Apply filters logic here
    console.log('Applying filters:', filters);
    fetchDonations();
  };

  const handleAccept = async (donationId) => {
    if (! window.confirm('Do you want to accept this donation?')) return;

    setAcceptingId(donationId);
    try {
      await acceptDonation(donationId);
      alert('Donation accepted successfully!');
      fetchDonations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept donation');
    } finally {
      setAcceptingId(null);
    }
  };

  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;
    
    if (diff < 0) return { text: 'Expired', urgent: true };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) {
      return { text: `Expires in ${minutes} minutes`, urgent: true };
    }
    if (hours < 24) {
      return { text: `Expires in ${hours} hours`, urgent: hours < 3 };
    }
    
    const days = Math.floor(hours / 24);
    return { text:  `Expires in ${days} days`, urgent: false };
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month:  'short',
      hour: '2-digit',
      minute:  '2-digit',
      hour12: true
    });
  };

  return (
    <DashboardLayout role="ngo" notificationCount={3}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Nearby Donations</h1>
            <p className="text-gray-600">Find and accept food donations near you</p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-600 text-xl">🔽</span>
            <h2 className="font-bold text-gray-800">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Distance</label>
              <select
                name="distance"
                value={filters.distance}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="20">Within 20 km</option>
              </select>
            </div>

            {/* Food Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Food Type</label>
              <select
                name="foodType"
                value={filters. foodType}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All types</option>
                <option value="Cooked Food">Cooked Food</option>
                <option value="Raw Ingredients">Raw Ingredients</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Bakery">Bakery</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
              </select>
            </div>

            {/* Freshness Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Freshness</label>
              <select
                name="freshness"
                value={filters.freshness}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All</option>
                <option value="fresh">Fresh (Cooked today)</option>
                <option value="packaged">Packaged</option>
                <option value="urgent">Urgent (Expiring soon)</option>
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Content:  List View or Map View */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl text-gray-600">Loading donations...</div>
              </div>
            ) : donations.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <p className="text-lg text-gray-600">No donations available at the moment</p>
              </div>
            ) : (
              donations. map((donation) => {
                const timeInfo = getTimeRemaining(donation.expiryTime);
                const isUrgent = timeInfo.urgent;

                return (
                  <div
                    key={donation._id}
                    className={`bg-white rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${
                      isUrgent ? 'border-2 border-orange-400' : 'border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{donation.foodName}</h3>
                          {isUrgent && (
                            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                              ⚠ Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{donation.restaurant?. organizationName || 'Restaurant'}</p>
                      </div>

                      <button
                        onClick={() => handleAccept(donation._id)}
                        disabled={acceptingId === donation._id}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {acceptingId === donation._id ? 'Accepting...' : 'View Details'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-orange-500">🍽️</span>
                        <span className="text-sm">{donation.quantity}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-blue-500">📍</span>
                        <span className="text-sm">{donation.distance || '1. 2'} km away</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <span className={isUrgent ? 'text-red-500' : 'text-green-500'}>⏰</span>
                        <span className={`text-sm ${isUrgent ?  'text-red-600 font-semibold' : ''}`}>
                          {timeInfo.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-purple-500">🍴</span>
                        <span className="text-sm">{donation.category}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>📍</span>
                        <span>{donation.pickupAddress. street}, {donation.pickupAddress.city}</span>
                      </div>
                      {donation.restaurant?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📞</span>
                          <a href={`tel:${donation.restaurant.phone}`} className="text-blue-600 hover:underline">
                            {donation.restaurant.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // Map View
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-gray-400">📍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Interactive Map View</h3>
              <p className="text-gray-600 text-center max-w-md">
                Pins showing donation locations with distance indicators
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Map integration coming soon (Google Maps / Leaflet)
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NearbyDonations;