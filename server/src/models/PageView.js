import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    page: {
      type: String,
      required: true,
    },
    referrer: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    browser: {
      type: String,
      default: '',
    },
    os: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ visitorId: 1, createdAt: -1 });
pageViewSchema.index({ page: 1, createdAt: -1 });

const PageView = mongoose.model('PageView', pageViewSchema);

export default PageView;
