const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  // Essential for linking traces to the User Dossier
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  websiteUrl: {
    type: String,
    required: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  // Updated to match the frontend selection options
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'fashion', 'home', 'services', 'luxury', 'software', 'other'],
    default: 'other'
  },
  price: {
    type: Number,
    required: true
  },
  // Global currency support
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
    default: 'USD'
  },
  // Supports the new Partial/Wrong Item outcome
  outcome: {
    type: String,
    required: true,
    enum: ['delivered', 'partial', 'not_delivered'],
    default: 'delivered'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);