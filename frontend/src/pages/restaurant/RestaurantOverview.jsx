import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Package, Heart, Clock, TrendingUp } from 'lucide-react';
import { getDonationStats, getMyDonations } from '../../services/donationService';

const RestaurantOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalDonationsChange: 0,
    activeDonations: 0,
    completedDonations: 0,
    mealsSaved:  0,
    mealsSavedChange: 0,
    foodSavedKg:  0,
    foodSavedChange: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await getDonationStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // Fetch recent donations (last 3)
      const donationsRes = await getMyDonations();
      if (donationsRes.success) {
        setRecentActivity(donationsRes. data. slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Picked Up': { bg: 'bg-green-100', text:  'text-green-700', label: 'Picked Up' },
      'Accepted': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Accepted' },
      'Pending': { bg:  'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
    };
    return styles[status] || styles['Pending'];
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const formatChange = (change) => {
    if (change === 0) return null;
    const icon = change > 0 ? '↗' : '↘';
    const color = change > 0 ? 'text-green-600' :  'text-red-600';
    return (
      <span className={`${color} text-sm font-semibold`}>
        {icon} {change > 0 ? '+' : ''}{change}%
      </span>
    );
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <DashboardLayout role="restaurant">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="restaurant">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.organizationName || 'Tasty Bites'}!  👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Here's your impact summary</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Donations */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="text-blue-600" size={20} />
              </div>
              {formatChange(stats.totalDonationsChange)}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.totalDonations}</h3>
            <p className="text-xs sm:text-sm text-gray-600">Total Donations</p>
          </div>

          {/* Meals Saved */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Heart className="text-green-600" size={20} />
              </div>
              {formatChange(stats.mealsSavedChange)}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.mealsSaved. toLocaleString()}</h3>
            <p className="text-xs sm:text-sm text-gray-600">Meals Saved</p>
          </div>

          {/* Active Donations */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="text-orange-600" size={20} />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.activeDonations}</h3>
            <p className="text-xs sm:text-sm text-gray-600">Active Donations</p>
          </div>

          {/* Food Saved (kg) */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              {formatChange(stats.foodSavedChange)}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.foodSavedKg}</h3>
            <p className="text-xs sm:text-sm text-gray-600">Food Saved (kg)</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/restaurant/add-donation')}
              className="px-4 sm:px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              + Add New Donation
            </button>
            <button
              onClick={() => navigate('/restaurant/donations')}
              className="px-4 sm:px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors text-sm sm:text-base"
            >
              View Active Donations
            </button>
            <button
              onClick={() => navigate('/restaurant/history')}
              className="px-4 sm:px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors text-sm sm: text-base"
            >
              View History
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">Recent Activity</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {recentActivity. length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm sm:text-base">No recent activity</p>
            ) : (
              recentActivity.map((donation) => {
                const statusConfig = getStatusBadge(donation.status);
                
                return (
                  <div
                    key={donation._id}
                    className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-600 transition-colors cursor-pointer"
                    onClick={() => navigate('/restaurant/donations')}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">{donation.foodName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {donation.acceptedBy?.organizationName || 'Pending acceptance'} • {donation.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{getTimeAgo(donation. createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantOverview;