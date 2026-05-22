const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: '',
  },
  type: {
    type: String,
    required: true,
    enum: ['notes', 'ppt', 'past-paper', 'textbook', 'video', 'other'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  courseCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    default: '',
  },
  filePublicId: {
    type: String,
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  fileFormat: {
    type: String,
    default: '',
  },
  pageCount: {
    type: Number,
    default: 0,
  },
  year: {
    type: Number,
    min: 2000,
    max: new Date().getFullYear() + 1,
  },
  professor: {
    type: String,
    trim: true,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, min: 1, max: 5 },
  }],
  averageRating: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

resourceSchema.index({
  title: 'text',
  subject: 'text',
  description: 'text',
  tags: 'text',
  professor: 'text',
  courseCode: 'text',
});

resourceSchema.methods.calcAverageRating = function () {
  if (this.ratings.length === 0) { this.averageRating = 0; return; }
  const sum = this.ratings.reduce((acc, r) => acc + r.score, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
};

module.exports = mongoose.model('Resource', resourceSchema);