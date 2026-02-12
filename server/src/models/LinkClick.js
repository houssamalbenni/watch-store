/**
 * LinkClick Model - Track all link clicks (leads, WhatsApp, etc.)
 */

import mongoose from 'mongoose';

const LinkClickSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Anonymous clicks allowed
    },
    linkType: {
      type: String,
      enum: ['whatsapp', 'email', 'phone', 'inquiry_form', 'other'],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    productName: String,
    destination: String, // WhatsApp number, email, phone, etc.
    source: {
      page: String, // e.g., /product/123, /shop, /home
      referrer: String,
    },
    userAgent: String,
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
LinkClickSchema.index({ linkType: 1, createdAt: -1 });
LinkClickSchema.index({ productId: 1 });
LinkClickSchema.index({ createdAt: -1 });

export default mongoose.model('LinkClick', LinkClickSchema);
