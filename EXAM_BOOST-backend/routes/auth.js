const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ─── Helper: Generate JWT ──────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── POST /api/auth/register ───────────────────────────────────────────────
// @desc  Register new user
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('course').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, course } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered.' });
      }

      const user = await User.create({ name, email, password, course });

      const token = generateToken(user._id);

      res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          course: user.course,
          role: user.role,
          points: user.points,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during registration.' });
    }
  }
);

// ─── POST /api/auth/login ──────────────────────────────────────────────────
// @desc  Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Login successful!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          course: user.course,
          role: user.role,
          points: user.points,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during login.' });
    }
  }
);

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
// @desc  Get current logged-in user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedResources', 'title type subject');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user.' });
  }
});

module.exports = router;
