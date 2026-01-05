const mongoose = require('mongoose');
const User = require('./User');

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_donations', 'view_analytics', 'manage_content']
  }]
});

const Admin = User.discriminator('admin', adminSchema);

module.exports = Admin;