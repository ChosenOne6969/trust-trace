const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');

// @route   GET api/reports/my-traces
// @desc    Get all traces by the logged-in user
// @access  Private
router.get('/my-traces', auth, async (req, res) => {
  try {
    // Added safety check: ensure req.user exists before querying
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'Authorization denied' });
    }

    const reports = await Report.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json(reports || []); // Ensure we always return at least an empty array
  } catch (err) {
    console.error("Error fetching user traces:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/reports/submit
// @desc    Submit a new trace and increment user score
router.post('/submit', auth, async (req, res) => {
  // Added 'currency' to the destructured body to match our new frontend
  const { websiteUrl, productName, category, price, outcome, currency } = req.body;
  
  try {
    const newReport = new Report({
      user: req.user.id,
      websiteUrl,
      productName,
      category,
      price,
      outcome,
      currency: currency || 'USD' // Default to USD if not provided
    });

    const report = await newReport.save();

    // Increment user's reportCount
    await User.findByIdAndUpdate(req.user.id, { $inc: { reportCount: 1 } });

    res.json(report);
  } catch (err) {
    console.error("Submission crash:", err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reports/recent/feed
// @desc    Get the global feed for the Dashboard
router.get('/recent/feed', async (req, res) => {
  try {
    // Increased limit slightly to make the dashboard feel more active
    const reports = await Report.find().sort({ timestamp: -1 }).limit(10);
    
    // Return empty array instead of 404 if no traces exist yet
    res.json(reports || []);
  } catch (err) {
    console.error("Dashboard feed error:", err.message);
    res.status(500).send('Server error');
  }
});

// PRESERVED: Snapshot route
router.get('/snapshot/:url', async (req, res) => {
  try {
    const reports = await Report.find({ websiteUrl: req.params.url });
    if (reports.length === 0) return res.status(200).json({ msg: 'New entity', successRate: 0, reportVolume: 0 });

    const deliveredCount = reports.filter(r => r.outcome === 'delivered').length;
    const successRate = (deliveredCount / reports.length) * 100;

    res.json({
      websiteUrl: req.params.url,
      successRate,
      reportVolume: reports.length
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;