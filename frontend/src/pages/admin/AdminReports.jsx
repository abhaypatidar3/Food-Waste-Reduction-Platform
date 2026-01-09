import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminAPI } from '../../services/adminService';
import { useQuery } from '@tanstack/react-query';

import { 
  Users, 
  ChefHat, 
  Heart, 
  TrendingUp,
  Calendar,
  Activity,
  PieChart,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  FileText,
  Eye
} from 'lucide-react';

const AdminReports = () => {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  const {data, isLoading:loading, isError, error, refetch } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async ()=>{
      const response = await adminAPI.getReports();
      if (response. success) {
        setLastUpdated(new Date());
        return response.data;
      }
      throw new Error('Failed to fetch reports');
    },
    staleTime: 60*1000,
    refetchOnMount: true,
    refetchOnWindowFocus:false,
    retry:2
  })

  const reports = data || null;

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export functionality coming soon!');
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="admin">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <p className="font-semibold">Error Loading Reports</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!reports) return null;

  const { overview, timeBasedAnalytics, roleDistribution, verificationByRole, recentActivity, statusOverview } = reports;

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Analytics & Reports</h1>
            <p className="text-sm sm:text-base text-gray-600">Comprehensive platform analytics and insights</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-gray-500 mb-6">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}

        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          <div className="flex p-2 gap-2 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Analytics', icon: Users },
              { id: 'activity', label: 'Recent Activity', icon: Activity },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeSection === section.id
                    ? 'bg-green-600 text-white font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <section.icon size={18} />
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <TimeCard
                title="Today"
                value={timeBasedAnalytics.today}
                icon={Calendar}
                color="blue"
              />
              <TimeCard
                title="This Week"
                value={timeBasedAnalytics.thisWeek}
                icon={Activity}
                color="green"
              />
              <TimeCard
                title="This Month"
                value={timeBasedAnalytics.thisMonth}
                icon={TrendingUp}
                color="purple"
              />
            </div>

            {/* User Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-green-600" size={24} />
                <h2 className="text-lg font-bold text-gray-800">User Status Overview</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusOverview.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">{item.status}</p>
                    <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            {/* Role Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="text-green-600" size={24} />
                <h2 className="text-lg font-bold text-gray-800">Role Distribution</h2>
              </div>
              <div className="space-y-5">
                {roleDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {item.role === 'Restaurant' && <ChefHat size={18} className="text-orange-600" />}
                        {item.role === 'NGO' && <Heart size={18} className="text-green-600" />}
                        {item.role === 'Admin' && <Users size={18} className="text-purple-600" />}
                        <span className="text-sm font-medium text-gray-700">{item. role}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          item.role === 'Restaurant' ? 'bg-orange-500' : 
                          item.role === 'NGO' ? 'bg-green-500' :  'bg-purple-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Restaurants Verification */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="text-orange-600" size={24} />
                  <h2 className="text-lg font-bold text-gray-800">Restaurants Verification</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-sm font-medium text-gray-700">Verified</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      {verificationByRole. restaurants. verified}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-red-600" size={20} />
                      <span className="text-sm font-medium text-gray-700">Unverified</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      {verificationByRole. restaurants.unverified}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Verification Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {verificationByRole.restaurants.verificationRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* NGOs Verification */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="text-green-600" size={24} />
                  <h2 className="text-lg font-bold text-gray-800">NGOs Verification</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-sm font-medium text-gray-700">Verified</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      {verificationByRole.ngos.verified}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-red-600" size={20} />
                      <span className="text-sm font-medium text-gray-700">Unverified</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      {verificationByRole.ngos. unverified}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Verification Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {verificationByRole.ngos.verificationRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Section */}
        {activeSection === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="text-green-600" size={24} />
                <h2 className="text-lg font-bold text-gray-800">Recent Registrations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        User
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Role
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentActivity. map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name[0]. toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            user.role === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                            user.role === 'ngo' ? 'bg-green-100 text-green-800' : 
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            {user.isVerified ? (
                              <>
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-xs text-green-600 font-medium">Verified</span>
                              </>
                            ) : (
                              <>
                                <Clock size={16} className="text-orange-500" />
                                <span className="text-xs text-orange-600 font-medium">Pending</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <h3 className={`text-3xl font-bold text-gray-800 mb-1`}>{value}</h3>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
};

// Time Card Component
const TimeCard = ({ title, value, icon:  Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
      </div>
      <p className="text-xs text-gray-500">New registrations</p>
    </div>
  );
};

export default AdminReports;