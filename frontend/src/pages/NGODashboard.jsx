import { useState, useEffect } from 'react';
import { getNearbyDonations, getAllDonations } from '../services/donationService';
import NGODonationCard from '../components/ngo/NGODonationCard';

const NGODashboard = () => {
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // available, accepted, completed
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch available donations (Pending status)
      const availableRes = await getNearbyDonations({ status: 'Pending' });
      setAvailableDonations(availableRes.data || []);

      // Fetch my accepted and completed donations
      const myDonationsRes = await getAllDonations();
      const filtered = (myDonationsRes.data || []).filter(
        d => d.status === 'Accepted' || d.status === 'Picked Up'
      );
      setMyDonations(filtered);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDonations = () => {
    let donations = [];
    
    if (activeTab === 'available') {
      donations = availableDonations;
    } else if (activeTab === 'accepted') {
      donations = myDonations. filter(d => d.status === 'Accepted');
    } else if (activeTab === 'completed') {
      donations = myDonations.filter(d => d.status === 'Picked Up');
    }

    if (categoryFilter !== 'all') {
      donations = donations.filter(d => d.category === categoryFilter);
    }

    return donations;
  };

  const filteredDonations = getFilteredDonations();

  const categories = ['Cooked Food', 'Raw Ingredients', 'Packaged Food', 'Bakery', 'Fruits & Vegetables', 'Other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">NGO Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Browse and accept food donations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              📦
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{availableDonations.length}</h3>
              <p className="text-xs sm:text-sm text-gray-600">Available Donations</p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              ✋
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {myDonations.filter(d => d.status === 'Accepted').length}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              ✅
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {myDonations.filter(d => d.status === 'Picked Up').length}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 border-b-2 border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'available'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Available Donations
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'accepted'
                ?  'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            My Accepted
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'completed'
                ?  'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              categoryFilter === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                categoryFilter === category
                  ?  'bg-green-500 text-white'
                  :  'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Donations Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5">
            {activeTab === 'available' && 'Available Donations'}
            {activeTab === 'accepted' && 'My Accepted Donations'}
            {activeTab === 'completed' && 'Completed Donations'}
            {' '}({filteredDonations.length})
          </h2>

          {filteredDonations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 sm:p-16 text-center shadow-md">
              <p className="text-base sm:text-lg text-gray-600">No donations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredDonations. map(donation => (
                <NGODonationCard
                  key={donation._id}
                  donation={donation}
                  onUpdate={fetchData}
                  showActions={activeTab !== 'completed'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;