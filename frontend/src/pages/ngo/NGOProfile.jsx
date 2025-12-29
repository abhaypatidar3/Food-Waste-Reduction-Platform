import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  User, Mail, Phone, MapPin, Building, Users, Edit2, Save, X, 
  Camera, Check, AlertCircle, Award, Calendar 
} from 'lucide-react';
import { authAPI } from '../../services/api';
import api from '../../services/api';

const NGOProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    organizationName:  '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state:  '',
      zipCode: ''
    },
    description: '',
    registrationNumber: '',
    servingArea: '',
    capacity: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getMe();
      if (response.success) {
        setUser(response.user);
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
          registrationNumber: response.user.registrationNumber || '',
          servingArea: response.user.servingArea || '',
          capacity: response.user.capacity || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name. includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ... prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.put('/auth/profile', formData);
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON. stringify(response.data.user));
        setEditMode(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type:  '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?. data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchProfile(); // Reset form data
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <DashboardLayout role="ngo">
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
    <DashboardLayout role="ngo">
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Profile Settings</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your NGO information</p>
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
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
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
                <Users className="text-green-600" size={48} />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-8 pb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {user?.organizationName || 'NGO Name'}
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  NGO
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

              {/* Phone & Registration Number */}
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
                    <Award className="inline-block w-4 h-4 mr-2 text-gray-500" />
                    Registration Number
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData. registrationNumber}
                      onChange={handleChange}
                      placeholder="NGO123456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.registrationNumber || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Serving Area & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline-block w-4 h-4 mr-2 text-gray-500" />
                    Serving Area
                  </label>
                  {editMode ?  (
                    <input
                      type="text"
                      name="servingArea"
                      value={formData.servingArea}
                      onChange={handleChange}
                      placeholder="Mumbai, Thane, Navi Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.servingArea || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="inline-block w-4 h-4 mr-2 text-gray-500" />
                    Daily Capacity
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="capacity"
                      value={formData. capacity}
                      onChange={handleChange}
                      placeholder="200 people/day"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {user?.capacity || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  About Your NGO
                </label>
                {editMode ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your NGO's mission and activities..."
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
                        value={formData.address.street}
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus: ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                          {user?.address?.city || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">State</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="address.state"
                          value={formData. address.state}
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
                      {editMode ? (
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          placeholder="400001"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                          {user?.address?. zipCode || 'Not provided'}
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

export default NGOProfile;