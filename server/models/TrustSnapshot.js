const mongoose = require('mongoose');

const TrustSnapshotSchema = new mongoose.Schema({
  websiteUrl: { type: String, required: true, unique: true }, // 
  successRate: { type: Number, default: 0 }, // 
  responseScore: { type: Number, default: 0 }, // 
  reportVolume: { type: Number, default: 0 }, // 
  confidenceLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'low' 
  }, // 
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrustSnapshot', TrustSnapshotSchema);