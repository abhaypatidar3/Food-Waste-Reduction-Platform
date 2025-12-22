import { useState } from 'react';
import { createDonation } from '../../services/donationService';

const AddDonationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    category: 'Cooked Food',
    expiryTime: '',
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    pickupInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createDonation(formData);
      alert('Donation added successfully!');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 max-w-3xl mx-auto shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Add New Donation</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-red-500 text-3xl leading-none transition-colors"
        >
          ×
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Food Name & Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Food Name *
            </label>
            <input
              type="text"
              name="foodName"
              value={formData.foodName}
              onChange={handleChange}
              placeholder="e.g., Biryani, Fresh Vegetables"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 5 kg, 20 plates, 10 liters"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Category & Expiry Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            >
              <option value="Cooked Food">Cooked Food</option>
              <option value="Raw Ingredients">Raw Ingredients</option>
              <option value="Packaged Food">Packaged Food</option>
              <option value="Bakery">Bakery</option>
              <option value="Fruits & Vegetables">Fruits & Vegetables</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expiry Time *
            </label>
            <input
              type="datetime-local"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            name="pickupAddress.street"
            value={formData.pickupAddress.street}
            onChange={handleChange}
            placeholder="Building/Street"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {/* City, State, Zip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="pickupAddress.city"
              value={formData.pickupAddress.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              name="pickupAddress. state"
              value={formData.pickupAddress.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Zip Code *
            </label>
            <input
              type="text"
              name="pickupAddress.zipCode"
              value={formData.pickupAddress.zipCode}
              onChange={handleChange}
              placeholder="Zip Code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Pickup Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pickup Instructions
          </label>
          <textarea
            name="pickupInstructions"
            value={formData.pickupInstructions}
            onChange={handleChange}
            placeholder="Any special instructions for pickup..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-vertical"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Donation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDonationForm;