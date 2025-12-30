import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminService';
import { 
  Users, 
  ChefHat, 
  Heart, 
  UserCheck, 
  UserX, 
  TrendingUp,
  Calendar,
  Activity,
  PieChart,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AnalyticsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getReports();
      setReports(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Load reports error:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={24} />
          <div>
            <p className="font-semibold">Error Loading Analytics</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (! reports) return null;

  const { overview, timeBasedAnalytics, roleDistribution, verificationByRole, recentActivity, monthlyTrends, statusOverview } = reports;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <div className="text-right">
          <button
            onClick={loadReports}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overview.totalUsers}
          icon={Users}
          color="blue"
          subtitle={`${overview.verificationRate}% verified`}
        />
        <StatCard
          title="Restaurants"
          value={overview. totalRestaurants}
          icon={ChefHat}
          color="orange"
          subtitle="Food donors"
        />
        <StatCard
          title="NGOs"
          value={overview.totalNGOs}
          icon={Heart}
          color="green"
          subtitle="Food recipients"
        />
        <StatCard
          title="This Month"
          value={timeBasedAnalytics.thisMonth}
          icon={TrendingUp}
          color="purple"
          subtitle="New registrations"
        />
      </div>

      {/* Time-Based Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <h3 className="text-2xl font-bold text-gray-800">{timeBasedAnalytics. today}</h3>
            </div>
          </div>
          <p className="text-xs text-gray-500">New users today</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <h3 className="text-2xl font-bold text-gray-800">{timeBasedAnalytics. thisWeek}</h3>
            </div>
          </div>
          <p className="text-xs text-gray-500">Weekly registrations</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <h3 className="text-2xl font-bold text-gray-800">{timeBasedAnalytics.thisMonth}</h3>
            </div>
          </div>
          <p className="text-xs text-gray-500">Monthly registrations</p>
        </div>
      </div>

      {/* Role Distribution & Verification Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Role Distribution</h2>
          </div>
          <div className="space-y-4">
            {roleDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item. role}</span>
                  <span className="text-sm font-bold text-gray-800">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      item.role === 'Restaurant' ? 'bg-orange-500' :
                      item.role === 'NGO' ? 'bg-green-500' :  'bg-purple-500'
                    }`}
                    style={{ width:  `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Verification Status</h2>
          </div>
          <div className="space-y-4">
            {/* Restaurants */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ChefHat size={16} className="text-orange-600" />
                  Restaurants
                </span>
                <span className="text-sm font-bold text-green-600">
                  {verificationByRole.restaurants. verificationRate}% verified
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-600">
                <span>✓ Verified:  {verificationByRole.restaurants. verified}</span>
                <span>✗ Unverified:  {verificationByRole.restaurants. unverified}</span>
              </div>
            </div>

            {/* NGOs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Heart size={16} className="text-green-600" />
                  NGOs
                </span>
                <span className="text-sm font-bold text-green-600">
                  {verificationByRole.ngos.verificationRate}% verified
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-600">
                <span>✓ Verified: {verificationByRole.ngos.verified}</span>
                <span>✗ Unverified: {verificationByRole.ngos.unverified}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Overview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">User Status Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusOverview.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">{item.status}</p>
              <p className="text-2xl font-bold text-gray-800">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-purple-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Recent Registrations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentActivity.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                      user.role === 'ngo' ? 'bg-green-100 text-green-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`flex items-center gap-1 text-xs ${
                      user. isVerified ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {user.isVerified ? <UserCheck size={14} /> :  <UserX size={14} />}
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="py-4 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue:  'text-blue-600 bg-blue-100',
    orange: 'text-orange-600 bg-orange-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${colorClasses[color]. split(' ')[0]} mb-2`}>{value}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;