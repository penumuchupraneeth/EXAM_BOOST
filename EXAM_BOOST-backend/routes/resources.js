const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// ─── GET /api/resources ────────────────────────────────────────────────────
// @desc  Get all resources with search, filter, pagination
// @query search, type, category, subject, year, sort, page, limit
router.get('/', async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      subject,
      year,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isApproved: true };

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (year) filter.year = parseInt(year);

    // Sort options
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { views: -1 },
      downloads: { downloads: -1 },
      rating: { averageRating: -1 },
    };

    const sortOption = sortMap[sort] || sortMap.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Resource.countDocuments(filter);

    const resources = await Resource.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name')
      .populate('category', 'name icon slug');

    res.json({
      resources,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch resources.' });
  }
});

// ─── GET /api/resources/trending ──────────────────────────────────────────
// @desc  Get trending resources (most viewed in last 7 days)
router.get('/trending', async (req, res) => {
  try {
    const resources = await Resource.find({ isApproved: true })
      .sort({ views: -1, downloads: -1 })
      .limit(6)
      .populate('uploadedBy', 'name')
      .populate('category', 'name icon');

    res.json({ resources });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch trending resources.' });
  }
});

// ─── GET /api/resources/:id ────────────────────────────────────────────────
// @desc  Get single resource + increment view count
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name course')
      .populate('category', 'name icon slug');

    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    // Increment views
    resource.views += 1;
    await resource.save();

    res.json({ resource });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Resource not found.' });
    res.status(500).json({ error: 'Could not fetch resource.' });
  }
});

// ─── POST /api/resources ──────────────────────────────────────────────────
// @desc  Upload a new resource (auth required)
router.post(
  '/',
  protect,
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').isIn(['notes', 'ppt', 'past-paper', 'textbook', 'video', 'other'])
      .withMessage('Invalid resource type'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file?.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id, { resource_type: 'raw' });
      }
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title, description, type, subject,
        courseCode, category, year, professor, tags,
      } = req.body;

      // Handle video URL vs file upload
      let fileUrl = req.body.videoUrl || '';
      let filePublicId = '';
      let fileSize = 0;
      let fileFormat = '';

      if (req.file) {
        fileUrl = req.file.path;
        filePublicId = req.file.filename;
        fileSize = req.file.size || 0;
        fileFormat = req.file.mimetype;
      } else if (!req.body.videoUrl) {
        return res.status(400).json({ error: 'A file or video URL is required.' });
      }

      const resource = await Resource.create({
        title,
        description,
        type,
        subject,
        courseCode,
        category,
        uploadedBy: req.user._id,
        fileUrl,
        filePublicId,
        fileSize,
        fileFormat,
        year: year ? parseInt(year) : undefined,
        professor,
        tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      });

      // Increment user's upload count & points
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { uploadedCount: 1, points: 10 },
      });

      // Increment category resource count
      await Category.findByIdAndUpdate(category, {
        $inc: { resourceCount: 1 },
      });

      res.status(201).json({ message: 'Resource uploaded successfully!', resource });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not upload resource.' });
    }
  }
);

// ─── PUT /api/resources/:id ────────────────────────────────────────────────
// @desc  Update a resource (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this resource.' });
    }

    const allowed = ['title', 'description', 'subject', 'courseCode', 'year', 'professor', 'tags'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) resource[field] = req.body[field];
    });

    await resource.save();
    res.json({ message: 'Resource updated.', resource });
  } catch (err) {
    res.status(500).json({ error: 'Could not update resource.' });
  }
});

// ─── DELETE /api/resources/:id ─────────────────────────────────────────────
// @desc  Delete a resource (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this resource.' });
    }

    // Delete file from Cloudinary
    if (resource.filePublicId) {
      await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' });
    }

    await resource.deleteOne();

    // Decrement counts
    await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { uploadedCount: -1 } });
    await Category.findByIdAndUpdate(resource.category, { $inc: { resourceCount: -1 } });

    res.json({ message: 'Resource deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete resource.' });
  }
});

// ─── POST /api/resources/:id/save ─────────────────────────────────────────
// @desc  Save / unsave a resource (toggle)
router.post('/:id/save', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedResources.includes(req.params.id);

    if (alreadySaved) {
      user.savedResources.pull(req.params.id);
      resource.saves = Math.max(0, resource.saves - 1);
    } else {
      user.savedResources.push(req.params.id);
      resource.saves += 1;
    }

    await user.save();
    await resource.save();

    res.json({
      saved: !alreadySaved,
      message: alreadySaved ? 'Resource unsaved.' : 'Resource saved to your library!',
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not save resource.' });
  }
});

// ─── POST /api/resources/:id/download ─────────────────────────────────────
// @desc  Increment download count + return file URL
router.post('/:id/download', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    resource.downloads += 1;
    await resource.save();

    res.json({ fileUrl: resource.fileUrl });
  } catch (err) {
    res.status(500).json({ error: 'Could not process download.' });
  }
});

// ─── POST /api/resources/:id/rate ─────────────────────────────────────────
// @desc  Rate a resource (1–5 stars)
router.post(
  '/:id/rate',
  protect,
  [body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const resource = await Resource.findById(req.params.id);
      if (!resource) return res.status(404).json({ error: 'Resource not found.' });

      // Remove existing rating from this user (if any) then add new
      resource.ratings = resource.ratings.filter(
        r => r.user.toString() !== req.user._id.toString()
      );
      resource.ratings.push({ user: req.user._id, score: req.body.score });
      resource.calcAverageRating();
      await resource.save();

      res.json({ message: 'Rating submitted!', averageRating: resource.averageRating });
    } catch (err) {
      res.status(500).json({ error: 'Could not submit rating.' });
    }
  }
);

module.exports = router;
