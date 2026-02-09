import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    specifications: {
      caseSize: { type: String, default: '' },
      caseMaterial: { type: String, default: '' },
      strapMaterial: { type: String, default: '' },
      strapColor: { type: String, default: '' },
      movement: { type: String, default: '' },
      waterResistance: { type: String, default: '' },
      dialColor: { type: String, default: '' },
      gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
    },
    images: [
      {
        type: String, // Cloudinary URL
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tags: [{ type: String }],
    featured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: 'watches',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ displayOrder: 1 });
productSchema.index({ 'specifications.gender': 1 });
productSchema.index({ title: 'text', brand: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
