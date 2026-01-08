import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DonationCard from '../../components/restaurant/DonationCard';
import { getMyDonations } from '../../services/donationService';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const RestaurantDonations = () => {
  const navigate = useNavigate();
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'accepted', 'pickedUp'

  const {data, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['RestaurantDonations'],
    queryFn: async ()=>{
      const response = await getMyDonations();
      if (response.success) {
        const activeDonations = response.data.filter(
          d => d.status === 'Picked Up' || d.status === 'Pending' || d.status === 'Accepted'
        );
        return activeDonations;
      }
      throw new Error('Failed to fetch donations');
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  const donations = data || [];

  const filterDonations = () => {
    if (activeTab === 'all') {
      setFilteredDonations(donations);
    } else if (activeTab === 'pending') {
      setFilteredDonations(donations.filter(d => d.status === 'Pending'));
    } else if (activeTab === 'accepted') {
      setFilteredDonations(donations.filter(d => d.status === 'Accepted'));
    } else if (activeTab === 'pickedUp') {
      setFilteredDonations(donations.filter(d => d.status === 'Picked Up'));
    }
  };

  const getCounts = () => {
    return {
      all: donations.length,
      pending: donations.filter(d => d.status === 'Pending').length,
      accepted: donations. filter(d => d.status === 'Accepted').length,
      pickedUp: donations.filter(d => d.status === 'Picked Up').length
    };
  };

  const counts = getCounts();

  if (loading) {
    return (
      <DashboardLayout role="restaurant">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="restaurant">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Active Donations</h1>
            <p className="text-sm sm:text-base text-gray-600">Track your ongoing and pending donations</p>
          </div>
          
          <button
            onClick={() => navigate('/restaurant/add-donation')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Add Donation</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 min-w-[120px] px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-600 border-transparent hover:text-green-600'
              }`}
            >
            All({counts.all})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 min-w-[120px] px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'pending'
                  ? 'text-green-600 border-green-600'
                  :  'text-gray-600 border-transparent hover:text-green-600'
              }`}
            >
            Pending({counts.pending})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 min-w-[120px] px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'accepted'
                  ? 'text-green-600 border-green-600'
                  :  'text-gray-600 border-transparent hover:text-green-600'
              }`}
            >
            Accepted({counts.accepted})
            </button>
            <button
              onClick={() => setActiveTab('pickedUp')}
              className={`flex-1 min-w-[120px] px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === 'pickedUp'
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-600 border-transparent hover:text-green-600'
              }`}
            >
              Picked Up ({counts.pickedUp})
            </button>
          </div>
        </div>

        {/* Donations Grid */}
        {filteredDonations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No donations found</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? "You haven't created any donations yet" 
                : `No ${activeTab} donations`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/restaurant/add-donation')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Your First Donation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onUpdate={fetchDonations}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RestaurantDonations;




