import { useState, useEffect } from 'react';
import { getMyDonations, getDonationStats } from '../services/donationService';
import AddDonationForm from '../components/restaurant/AddDonationForm';
import DonationCard from '../components/restaurant/DonationCard';

const RestaurantDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsRes, statsRes] = await Promise. all([
        getMyDonations(),
        getDonationStats()
      ]);
      setDonations(donationsRes. data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchData();
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    if (filter === 'pending') return donation.status === 'Pending';
    if (filter === 'accepted') return donation.status === 'Accepted';
    if (filter === 'picked-up') return donation.status === 'Picked Up';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Restaurant Dashboard</h1>
            <p className="text-gray-600">Manage your food donations and track impact</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
          >
            + Add Donation
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
                📦
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalDonations}</h3>
                <p className="text-sm text-gray-600">Total Donations</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-3xl">
                ⏳
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.activeDonations}</h3>
                <p className="text-sm text-gray-600">Active Donations</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">
                ✅
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.completedDonations}</h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center text-3xl">
                🍽️
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.mealsSaved}</h3>
                <p className="text-sm text-gray-600">Meals Saved</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Donation Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5 overflow-y-auto">
            <AddDonationForm
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 font-semibold rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500 hover:text-green-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-5 py-2 font-semibold rounded-lg transition-all ${
              filter === 'pending'
                ?  'bg-green-500 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500 hover:text-green-500'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-5 py-2 font-semibold rounded-lg transition-all ${
              filter === 'accepted'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500 hover:text-green-500'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setFilter('picked-up')}
            className={`px-5 py-2 font-semibold rounded-lg transition-all ${
              filter === 'picked-up'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500 hover:text-green-500'
            }`}
          >
            Picked Up
          </button>
        </div>

        {/* Donations List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            My Donations ({filteredDonations.length})
          </h2>
          
          {filteredDonations. length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center shadow-md">
              <p className="text-lg text-gray-600 mb-5">No donations found</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Your First Donation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredDonations.map(donation => (
                <DonationCard
                  key={donation._id}
                  donation={donation}
                  onUpdate={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;