const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Resource = require('../models/Resource');
const { protect, adminOnly } = require('../middleware/auth');

// ─── GET /api/users/leaderboard ───────────────────────────────────────────
// @desc  Top contributors by points
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('name course points uploadedCount')
      .sort({ points: -1 })
      .limit(10);

    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch leaderboard.' });
  }
});

// ─── GET /api/users/profile ───────────────────────────────────────────────
// @desc  Get current user profile + their uploads
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('savedResources', 'title type subject createdAt');

    const uploads = await Resource.find({ uploadedBy: req.user._id })
      .select('title type subject views downloads saves createdAt')
      .sort({ createdAt: -1 });

    res.json({ user, uploads });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile.' });
  }
});

// ─── PUT /api/users/profile ────────────────────────────────────────────────
// @desc  Update profile (name, course)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, course } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (course !== undefined) user.course = course.trim();

    await user.save();
    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// ─── GET /api/users/:id ────────────────────────────────────────────────────
// @desc  Get public profile of any user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name course points uploadedCount createdAt');

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const uploads = await Resource.find({ uploadedBy: req.params.id, isApproved: true })
      .select('title type subject views downloads createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ user, uploads });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'User not found.' });
    res.status(500).json({ error: 'Could not fetch user.' });
  }
});

module.exports = router;
