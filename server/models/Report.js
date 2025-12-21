const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  // Link to the User model - Essential for the Profile Page
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The entity being tracked
  websiteUrl: {
    type: String,
    required: true,
    trim: true
  },
  // Restored Metadata Fields
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'fashion', 'home', 'services', 'other']
  },
  price: {
    type: Number,
    required: true
  },
  // Experience Outcome
  outcome: {
    type: String,
    required: true,
    enum: ['delivered', 'partial', 'not_delivered'],
    default: 'delivered'
  },
  // Automatic Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);