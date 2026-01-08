import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllDonations, markAsPickedUp } from '../../services/donationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MyAcceptances = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [confirmingId, setConfirmingId] = useState(null);

  const {data, isLoading: loading, refetch} = useQuery({
    queryKey: ['ngoMyAcceptances'],
    queryFn: async ()=>{
      const response = await getAllDonations();
      return response;
    },
    staleTime: 60*1000,
    refetchOnMount: true,
    refetchOnWindowFocus:false,
    retry:2
  });

  const donations = (response?.data || []).filter(
    d=>d.status === 'Accepted' || d.status === 'Picked Up'
  );

  const markAsPickedUpMutation = useMutation({
    mutationFn: async (donationId) => {
      return await markAsPickedUp(donationId);
    },
    onSuccess: (_,donationId)=>{
      queryClient.setQueryData(['ngoMyAcceptances'], (old)=>{
        if(!old) return old;
        return old.map(d=>{
          d._id === donationId 
            ? { ...d, status: 'Picked Up', pickedUpAt: new Date().toISOString() }
            : d;
        });
      });
      refetch();
    },
    onError: (error)=>{
      alert(error. response?.data?.message || 'Failed to update donation');
    }
  })

  const handleConfirmPickup = async (donationId) => {
    if (!window.confirm('Confirm that you have picked up this donation? ')) return;
    markAsPickedUpMutation.mutate(donationId);
  };

  const getFilteredDonations = () => {
    if (activeTab === 'all') return donations;
    if (activeTab === 'pending') return donations.filter(d => d.status === 'Accepted');
    if (activeTab === 'completed') return donations.filter(d => d.status === 'Picked Up');
    return donations;
  };

  const filteredDonations = getFilteredDonations();

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeSince = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const allCount = donations.length;
  const pendingCount = donations.filter(d => d.status === 'Accepted').length;
  const completedCount = donations.filter(d => d.status === 'Picked Up').length;

  return (
    <DashboardLayout role="ngo" >
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Acceptances</h1>
          <p className="text-gray-600">Track donations you've accepted</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'all'
                  ?  'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              All ({allCount})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Pending Pickup ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'completed'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ?  (
              <div className="text-center py-12">
                <div className="text-xl text-gray-600">Loading... </div>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No donations found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredDonations.map((donation) => (
                  <div
                    key={donation._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{donation.foodName}</h3>
                        <p className="text-gray-600">{donation.restaurant?.organizationName || 'Restaurant'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1. 5 rounded-full text-sm font-bold ${
                          donation.status === 'Accepted'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {donation.status}
                        </span>

                        {donation.status === 'Accepted' && (
                          <button
                            onClick={() => handleConfirmPickup(donation._id)}
                            disabled={confirmingId === donation._id}
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <span>📦</span>
                            <span>{confirmingId === donation._id ?  'Confirming...' :  'Confirm Pickup'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-orange-500">🍽️</span>
                        <span className="text-sm">{donation. quantity}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-blue-500">📍</span>
                        <span className="text-sm">{donation.distance} km away</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-500">⏰</span>
                        <span className="text-sm"><b>Expiry:</b> {formatTime(donation.expiryTime)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📍</span>
                        <span>{donation.pickupAddress.street}, {donation.pickupAddress.city}</span>
                      </div>

                      {donation.restaurant?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📞</span>
                          <a href={`tel:${donation.restaurant.phone}`} className="text-blue-600 hover:underline">
                            {donation.restaurant.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {donation.status === 'Accepted' && donation.acceptedAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                          <span className="font-semibold">🎯 Accepted {getTimeSince(donation.acceptedAt)}</span>
                          {' • '}
                          <span>Please pickup before {formatTime(donation.expiryTime)}</span>
                        </p>
                      </div>
                    )}

                    {donation.status === 'Picked Up' && donation.pickedUpAt && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">✓ Completed {getTimeSince(donation. pickedUpAt)}</span>
                          {' • '}
                          <span>30 people fed</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyAcceptances;