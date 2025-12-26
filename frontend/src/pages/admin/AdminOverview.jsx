import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminAPI } from '../../services/adminService';
import { Users, Package, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading... </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Monitor platform activity and manage users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats?.users?.total || 0}</h3>
            <p className="text-sm text-gray-600 mb-2">Total Users</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-500">🏪 {stats?.users?.restaurants || 0} Restaurants</span>
              <span className="text-gray-500">🤝 {stats?.users?.ngos || 0} NGOs</span>
            </div>
          </div>

          {/* Total Donations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats?.donations?.total || 0}</h3>
            <p className="text-sm text-gray-600 mb-2">Total Donations</p>
            <p className="text-xs text-green-600 font-semibold">
              +{stats?.donations?.lastMonth || 0} this month
            </p>
          </div>

          {/* People Fed */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {stats?.impact?.peopleFed?. toLocaleString() || 0}
            </h3>
            <p className="text-sm text-gray-600 mb-2">People Fed</p>
            <p className="text-xs text-gray-500">{stats?.impact?.foodSaved || '0 donations'}</p>
          </div>

          {/* Pending Verification */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats?.users?.unverified || 0}</h3>
            <p className="text-sm text-gray-600 mb-2">Pending Verification</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
            >
              Review now →
            </button>
          </div>
        </div>

        {/* Donation Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-yellow-600" size={20} />
              <h4 className="font-bold text-gray-800">Pending</h4>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{stats?.donations?.pending || 0}</p>
            <p className="text-sm text-gray-600">Awaiting acceptance</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-blue-600" size={20} />
              <h4 className="font-bold text-gray-800">Accepted</h4>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{stats?.donations?.accepted || 0}</p>
            <p className="text-sm text-gray-600">Ready for pickup</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <h4 className="font-bold text-gray-800">Completed</h4>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{stats?.donations?.completed || 0}</p>
            <p className="text-sm text-gray-600">Successfully delivered</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Donations by Category</h2>
          <div className="space-y-3">
            {stats?.categories?.map((cat, index) => {
              const total = stats. donations. total;
              const percentage = total > 0 ? ((cat.count / total) * 100).toFixed(1) : 0;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat._id}</span>
                    <span className="text-sm font-bold text-gray-800">{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users size={20} />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => navigate('/admin/donations')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Package size={20} />
              <span>View Donations</span>
            </button>
            <p
              className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors" disabled
            >
              <span>Reports</span>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOverview;