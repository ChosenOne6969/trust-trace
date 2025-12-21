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
    // Finds only reports where the 'user' field matches the current JWT user ID
    const reports = await Report.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/reports/submit
// @desc    Submit a new trace and increment user score
// @access  Private
router.post('/submit', auth, async (req, res) => {
  const { websiteUrl, productName, category, price, outcome } = req.body;
  try {
    const newReport = new Report({
      user: req.user.id, // Mandatory for linking history to the profile
      websiteUrl,
      productName,
      category,
      price,
      outcome
    });

    const report = await newReport.save();

    // Increment user's reportCount so they move up the Leaderboard
    await User.findByIdAndUpdate(req.user.id, { $inc: { reportCount: 1 } });

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reports/snapshot/:url
router.get('/snapshot/:url', async (req, res) => {
  try {
    const reports = await Report.find({ websiteUrl: req.params.url });
    if (reports.length === 0) return res.status(404).json({ msg: 'No traces found' });

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

// @route   GET api/reports/recent/feed
router.get('/recent/feed', async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 }).limit(5);
    res.json(reports);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;