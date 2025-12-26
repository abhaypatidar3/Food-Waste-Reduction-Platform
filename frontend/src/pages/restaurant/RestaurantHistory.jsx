import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getMyDonations } from '../../services/donationService';
import { Calendar, TrendingUp, Award, Filter } from 'lucide-react';

const RestaurantHistory = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'table'
  const [filters, setFilters] = useState({
    dateRange: 'last7days',
    status: 'all',
    ngo: 'all'
  });
  const [stats, setStats] = useState({
    thisMonth: 0,
    totalImpact: 0,
    successRate: 0
  });
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, donations]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getMyDonations();
      if (response.success) {
        const allDonations = response.data;
        setDonations(allDonations);
        
        // Calculate stats
        calculateStats(allDonations);
        
        // Extract unique NGOs
        const uniqueNgos = [...new Set(allDonations
          .filter(d => d. acceptedBy)
          .map(d => d.acceptedBy. organizationName))];
        setNgos(uniqueNgos);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (donationsList) => {
    const now = new Date();
    const startOfMonth = new Date(now. getFullYear(), now.getMonth(), 1);

    // This month completed
    const thisMonth = donationsList.filter(d => 
      d.status === 'Picked Up' && new Date(d.pickedUpAt) >= startOfMonth
    ).length;

    // Total impact (food donated in kg)
    let totalImpactKg = 0;
    donationsList.filter(d => d.status === 'Picked Up').forEach(donation => {
      const match = donation.quantity.match(/(\d+\.?\d*)/);
      if (match) {
        const num = parseFloat(match[1]);
        if (donation.quantity.toLowerCase().includes('kg')) {
          totalImpactKg += num;
        } else if (donation.quantity.toLowerCase().includes('meal')) {
          totalImpactKg += num * 0.3; // 0.3 kg per meal
        } else {
          totalImpactKg += num * 0.2; // 0.2 kg per item
        }
      }
    });

    // Success rate (completed / total created)
    const totalCreated = donationsList.length;
    const completed = donationsList.filter(d => d.status === 'Picked Up').length;
    const successRate = totalCreated > 0 ? Math.round((completed / totalCreated) * 100) : 0;

    setStats({
      thisMonth,
      totalImpact: Math.round(totalImpactKg),
      successRate
    });
  };

  const applyFilters = () => {
    let filtered = [... donations];

    // Date range filter
    const now = new Date();
    if (filters.dateRange === 'last7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(d => new Date(d.createdAt) >= sevenDaysAgo);
    } else if (filters. dateRange === 'last30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(d => new Date(d. createdAt) >= thirtyDaysAgo);
    } else if (filters.dateRange === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(d => new Date(d.createdAt) >= startOfMonth);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered. filter(d => d.status === filters.status);
    }

    // NGO filter
    if (filters.ngo !== 'all') {
      filtered = filtered.filter(d => d.acceptedBy?. organizationName === filters.ngo);
    }

    setFilteredDonations(filtered);
  };

  const getImpactText = (donation) => {
    const match = donation.quantity.match(/(\d+\.?\d*)/);
    if (! match) return 'Impact tracked';

    const num = parseFloat(match[1]);
    const quantity = donation.quantity.toLowerCase();

    if (quantity.includes('meal')) {
      return `${num} people fed`;
    } else if (quantity.includes('kg')) {
      const meals = Math.round(num * 3);
      return `${meals} meals possible`;
    } else if (quantity.includes('item')) {
      return `${num} people fed`;
    } else {
      return `${Math.round(num * 2)} servings`;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Picked Up': 'bg-green-100 text-green-700',
      'Accepted': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return styles[status] || styles['Pending'];
  };

  const groupByDate = (donationsList) => {
    const grouped = {};
    donationsList. forEach(donation => {
      const date = new Date(donation.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(donation);
    });
    return grouped;
  };

  const groupedDonations = groupByDate(filteredDonations);

  if (loading) {
    return (
      <DashboardLayout role="restaurant">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="restaurant">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Donation History</h1>
            <p className="text-sm sm:text-base text-gray-600">View your past donations and impact</p>
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                viewMode === 'timeline' ?  'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                viewMode === 'table' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* This Month */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-600">This Month</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{stats.thisMonth}</p>
            <p className="text-sm text-gray-600">Completed Donations</p>
          </div>

          {/* Total Impact */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-600">Total Impact</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{stats.totalImpact} kg</p>
            <p className="text-sm text-gray-600">Food Donated</p>
          </div>

          {/* Success Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="text-purple-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-600">Success Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{stats.successRate}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e. target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All Time</option>
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus: ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All</option>
                <option value="Picked Up">Completed</option>
                <option value="Accepted">Accepted</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* NGO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NGO</label>
              <select
                value={filters.ngo}
                onChange={(e) => setFilters({ ...filters, ngo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus: ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All NGOs</option>
                {ngos.map((ngo, index) => (
                  <option key={index} value={ngo}>{ngo}</option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Timeline View</h2>

            {Object.keys(groupedDonations).length === 0 ? (
              <p className="text-center text-gray-500 py-12">No donations found</p>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedDonations).map(([date, dateDonations]) => (
                  <div key={date}>
                    {dateDonations.map((donation, index) => (
                      <div key={donation._id} className="relative pl-8 pb-8 last:pb-0">
                        {/* Timeline line */}
                        {index !== dateDonations.length - 1 && (
                          <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                        )}

                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ${
                          donation.status === 'Picked Up' ? 'bg-green-500' :
                          donation.status === 'Accepted' ? 'bg-blue-500' : 
                          donation.status === 'Cancelled' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>

                        {/* Date header (show once per date) */}
                        {index === 0 && (
                          <div className="text-sm font-semibold text-gray-500 mb-3">{date}</div>
                        )}

                        {/* Donation card */}
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 mb-1">{donation.foodName}</h3>
                              <p className="text-sm text-gray-600">
                                {donation.quantity} • {donation.acceptedBy?.organizationName || 'No NGO yet'} • {getImpactText(donation)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(donation.status)}`}>
                              {donation.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NGO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No donations found
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(donation.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{donation.foodName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{donation.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{donation.acceptedBy?.organizationName || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(donation.status)}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">{getImpactText(donation)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RestaurantHistory;