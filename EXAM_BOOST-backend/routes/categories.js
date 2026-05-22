const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// ─── GET /api/categories ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ resourceCount: -1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch categories.' });
  }
});

// ─── POST /api/categories ──────────────────────────────────────────────────
// @desc  Create category (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = await Category.create({ name, slug, icon, description });

    res.status(201).json({ category });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Category already exists.' });
    res.status(500).json({ error: 'Could not create category.' });
  }
});

module.exports = router;
