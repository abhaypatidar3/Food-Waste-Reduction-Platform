import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminAPI } from '../../services/adminService';
import { Package, Trash2, MapPin, Clock, User } from 'lucide-react';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDonations: 0
  });
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, [filters, pagination.currentPage]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDonations({
        page: pagination.currentPage,
        limit: 10,
        ... filters
      });

      if (response.success) {
        setDonations(response.donations);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalDonations: response.totalDonations
        });
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation?  This action cannot be undone.')) return;

    try {
      const response = await adminAPI.deleteDonation(donationId);
      if (response.success) {
        alert('Donation deleted successfully!');
        fetchDonations();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete donation');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Accepted': 'bg-blue-100 text-blue-700',
      'Picked Up': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;
    
    if (diff < 0) return { text: 'Expired', urgent: true };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) {
      return { text: `${minutes}m`, urgent: true };
    }
    if (hours < 24) {
      return { text: `${hours}h`, urgent: hours < 3 };
    }
    
    const days = Math.floor(hours / 24);
    return { text: `${days}d`, urgent: false };
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Donations Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Monitor and manage all donations</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Picked Up">Picked Up</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ... filters, category: e.target. value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Cooked Food">Cooked Food</option>
                <option value="Raw Ingredients">Raw Ingredients</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Bakery">Bakery</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading donations... </p>
            </div>
          ) : donations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-lg text-gray-600">No donations found</p>
            </div>
          ) : (
            donations.map((donation) => {
              const timeInfo = getTimeRemaining(donation. expiryTime);
              
              return (
                <div
                  key={donation._id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left:  Donation Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="text-green-600" size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold text-gray-800 text-lg">{donation.foodName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(donation.status)}`}>
                              {donation.status}
                            </span>
                            {timeInfo.urgent && donation.status === 'Pending' && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                Urgent
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                            {/* Restaurant */}
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span>
                                <strong>From:</strong> {donation.restaurant?. organizationName || 'Unknown'}
                              </span>
                            </div>

                            {/* NGO */}
                            {donation.acceptedBy && (
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400" />
                                <span>
                                  <strong>To:</strong> {donation.acceptedBy?. organizationName || 'Unknown'}
                                </span>
                              </div>
                            )}

                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-gray-400" />
                              <span>{donation.quantity}</span>
                            </div>

                            {/* Category */}
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">🍽️</span>
                              <span>{donation.category}</span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-gray-400" />
                              <span>{donation.pickupAddress?. city || 'N/A'}</span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2">
                              <Clock size={16} className={timeInfo.urgent ? 'text-red-500' : 'text-gray-400'} />
                              <span className={timeInfo.urgent ? 'text-red-600 font-semibold' : ''}>
                                {donation.status === 'Picked Up' 
                                  ? 'Completed' 
                                  : `Expires: ${timeInfo.text}`}
                              </span>
                            </div>
                          </div>

                          {/* Timestamps */}
                          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>
                              Created: {new Date(donation.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {donation.acceptedAt && (
                              <span>
                                Accepted: {new Date(donation.acceptedAt).toLocaleString('en-IN', {
                                  day:  '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute:  '2-digit'
                                })}
                              </span>
                            )}
                            {donation.pickedUpAt && (
                              <span>
                                Picked Up: {new Date(donation.pickedUpAt).toLocaleString('en-IN', {
                                  day:  '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute:  '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(donation._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination. totalPages > 1 && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {donations.length} of {pagination.totalDonations} donations
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {pagination.currentPage} of {pagination. totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination. totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Donation Details</h2>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Food Name</p>
                    <p className="font-semibold">{selectedDonation.foodName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="font-semibold">{selectedDonation.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold">{selectedDonation.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedDonation.status)}`}>
                      {selectedDonation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Restaurant Info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Restaurant</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold mb-2">{selectedDonation.restaurant?. organizationName}</p>
                  <p className="text-sm text-gray-600">{selectedDonation. restaurant?.email}</p>
                  <p className="text-sm text-gray-600">{selectedDonation. restaurant?.phone}</p>
                </div>
              </div>

              {/* NGO Info */}
              {selectedDonation.acceptedBy && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Accepted By</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold mb-2">{selectedDonation. acceptedBy?.organizationName}</p>
                    <p className="text-sm text-gray-600">{selectedDonation. acceptedBy?.email}</p>
                    <p className="text-sm text-gray-600">{selectedDonation.acceptedBy?.phone}</p>
                  </div>
                </div>
              )}

              {/* Pickup Address */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Pickup Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm">{selectedDonation.pickupAddress?.street}</p>
                  <p className="text-sm">{selectedDonation.pickupAddress?.city}, {selectedDonation.pickupAddress?.state}</p>
                  <p className="text-sm">{selectedDonation.pickupAddress?.zipCode}</p>
                </div>
              </div>

              {/* Pickup Instructions */}
              {selectedDonation.pickupInstructions && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Pickup Instructions</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                    {selectedDonation.pickupInstructions}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-semibold">
                      {new Date(selectedDonation.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-semibold">
                      {new Date(selectedDonation.expiryTime).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedDonation.acceptedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accepted: </span>
                      <span className="font-semibold">
                        {new Date(selectedDonation.acceptedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {selectedDonation.pickedUpAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Picked Up:</span>
                      <span className="font-semibold">
                        {new Date(selectedDonation. pickedUpAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedDonation(null)}
                className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDonations;