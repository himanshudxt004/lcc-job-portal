const mongoose = require('mongoose');

const BLOG_CATEGORIES = [
  'Career Tips',
  'Hiring Insights',
  'Company News',
  'Success Stories'
];

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 400,
      default: ''
    },
    content: {
      type: String,
      required: true,
      maxlength: 50000
    },
    category: {
      type: String,
      enum: BLOG_CATEGORIES,
      default: 'Career Tips'
    },
    coverImage: {
      type: String,
      default: ''
    },
    publishedAt: {
      type: Date,
      default: null
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

blogSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
module.exports.BLOG_CATEGORIES = BLOG_CATEGORIES;
