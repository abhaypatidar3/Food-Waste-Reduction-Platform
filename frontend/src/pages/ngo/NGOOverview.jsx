import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getNearbyDonations } from '../../services/donationService';
import { getNGOAnalytics } from '../../services/ngoService';

const NGOOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReceived: { count: 0, change: 0 },
    peopleFed: { count: 0, change: 0 },
    activeAcceptances: { count: 0, change: 0 },
    thisMonth:  { count: 0, change:  0 }
  });
  const [nearbyOpportunities, setNearbyOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const analyticsRes = await getNGOAnalytics();
      if (analyticsRes.success) {
        setStats(analyticsRes.analytics);
      }

      // Fetch nearby opportunities
      const donationsRes = await getNearbyDonations({ limit: 3, status: 'Pending' });
      setNearbyOpportunities(donationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      return { text: `${minutes} minutes`, urgent: true };
    }
    if (hours < 24) {
      return { text: `${hours} hours`, urgent: hours < 3 };
    }
    
    const days = Math.floor(hours / 24);
    return { text: `${days} days`, urgent: false };
  };

  const formatChange = (change) => {
    if (change === 0) return null;
    const icon = change > 0 ? '↗' : '↘';
    const color = change > 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={`${color} text-sm font-semibold`}>
        {icon} {change > 0 ? '+' : ''}{change}%
      </span>
    );
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <DashboardLayout role="ngo">
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
    <DashboardLayout role="ngo">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user.organizationName || 'Hope Foundation'}!  👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Here's your impact and recent opportunities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Total Received */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                <span className="text-xl sm:text-2xl">📦</span>
              </div>
              <div className="sm:text-right">
                {formatChange(stats.totalReceived. change)}
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              {stats.totalReceived.count}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Total Received</p>
          </div>

          {/* People Fed */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                <span className="text-xl sm:text-2xl">👥</span>
              </div>
              <div className="sm:text-right">
                {formatChange(stats.peopleFed.change)}
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              {stats.peopleFed.count. toLocaleString()}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">People Fed</p>
          </div>

          {/* Active Acceptances */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
              <div className="sm: text-right">
                {formatChange(stats.activeAcceptances.change)}
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              {stats.activeAcceptances.count}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Active Acceptances</p>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 sm:mb-0">
                <span className="text-xl sm:text-2xl">📅</span>
              </div>
              <div className="sm:text-right">
                {formatChange(stats.thisMonth. change)}
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              {stats. thisMonth.count}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">This Month</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/ngo/donations')}
              className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">🗺️</span>
              <span>Browse Nearby Donations</span>
            </button>
            <button
              onClick={() => navigate('/ngo/acceptances')}
              className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-colors text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">📋</span>
              <span>View My Acceptances</span>
            </button>
          </div>
        </div>

        {/* Nearby Opportunities */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Nearby Opportunities</h2>
            <button
              onClick={() => navigate('/ngo/donations')}
              className="text-green-600 hover:text-green-700 font-semibold text-xs sm:text-sm"
            >
              View all →
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {nearbyOpportunities.length === 0 ? (
              <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">No nearby donations available</p>
            ) : (
              nearbyOpportunities. map((donation) => {
                const timeInfo = getTimeRemaining(donation. expiryTime);
                const isUrgent = timeInfo.urgent;

                return (
                  <div
                    key={donation._id}
                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      isUrgent ? 'border-orange-300 bg-orange-50' :  'border-gray-200 bg-white'
                    }`}
                    onClick={() => navigate('/ngo/donations')}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{donation.foodName}</h3>
                          {isUrgent && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded whitespace-nowrap">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {donation.restaurant?. organizationName || 'Restaurant'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span>🍽️</span>
                        <span className="truncate">{donation.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{donation.distance || '1.2'} km</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>⏰</span>
                        <span className={isUrgent ? 'text-orange-600 font-semibold' : ''}>
                          {timeInfo. text}
                        </span>
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

export default NGOOverview;