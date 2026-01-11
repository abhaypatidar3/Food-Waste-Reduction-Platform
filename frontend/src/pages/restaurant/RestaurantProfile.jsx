import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  User, Mail, Phone, MapPin, Building, Clock, Edit2, Save, X, 
  Camera, Check, AlertCircle 
} from 'lucide-react';
import { authAPI } from '../../services/api';
import api from '../../services/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

const RestaurantProfile = () => {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    description: '',
    operatingHours: ''
  });


  const {data : user , isLoading, isError, refetch} = useQuery({
    queryKey: ['RestaurantProfileData'],
    queryFn: async ()=>{
      const response = await authAPI.getMe();
      if (response.success) {
        setFormData({
          organizationName: response.user.organizationName || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          address: {
            street: response.user.address?.street || '',
            city: response.user.address?. city || '',
            state: response.user.address?.state || '',
            zipCode: response.user.address?.zipCode || ''
          },
          description: response. user.description || '',
          operatingHours: response.user. operatingHours || ''
        });
        return response.user;
      }
      throw new Error('Failed to fetch profile');
    },
    staleTime: 5*60*1000,
    refetchOnMount:true,
    refetchOnWindowFocus:false,
    retry:1
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['restaurantProfile'], data.user);
        
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setEditMode(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        setTimeout(() => setMessage({ type:  '', text: '' }), 3000);
      }
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text:  error.response?.data?.message || 'Failed to update profile' 
      });
    }
  });



  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setEditMode(false);
    setMessage({ type: '', text:  '' });
    if (user) {
      setFormData({
        organizationName:  user.organizationName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?. zipCode || ''
        },
        description: user.description || '',
        operatingHours: user.operatingHours || ''
      });
    }
  };

  if(isLoading) {
    return (
      <DashboardLayout role="restaurant">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="restaurant">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Profile Settings</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your restaurant information</p>
          </div>
          
          {! editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ?  <Check size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover Section */}
          <div className="h-32 bg-gradient-to-r from-green-500 to-green-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <Building className="text-green-600" size={48} />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-8 pb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {user?.organizationName || 'Restaurant Name'}
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Restaurant
                </span>
                {user?.isVerified && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Check size={14} /> Verified
                  </span>
                )}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Organization Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="inline-block w-4 h-4 mr-2 text-gray-500" />
                    Organization Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.organizationName || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline-block w-4 h-4 mr-2 text-gray-500" />
                    Email Address
                  </label>
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              {/* Phone & Operating Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline-block w-4 h-4 mr-2 text-gray-500" />
                    Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline-block w-4 h-4 mr-2 text-gray-500" />
                    Operating Hours
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="operatingHours"
                      value={formData.operatingHours}
                      onChange={handleChange}
                      placeholder="9:00 AM - 11:00 PM"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.operatingHours || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                {editMode ? (
                  <textarea
                    name="description"
                    value={formData. description}
                    onChange={handleChange}
                    placeholder="Tell us about your restaurant..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                    {user?. description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="inline-block w-4 h-4 mr-2 text-gray-500" />
                  Address
                </label>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Street Address</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="address.street"
                        value={formData. address.street}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                        {user?. address?.street || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">City</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          placeholder="Mumbai"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                          {user?. address?.city || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">State</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          placeholder="Maharashtra"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                          {user?.address?.state || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Zip Code</label>
                      {editMode ?  (
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          placeholder="400001"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus: ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                          {user?.address?.zipCode || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Account Created</p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(user?.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Account Status</p>
                    <p className="text-gray-800 font-semibold">
                      {user?.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RestaurantProfile;