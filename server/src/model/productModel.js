import mongoose from 'mongoose';

export const productCategories = ['Books & Notes', 'Writing Things', 'Electronics', 'Toys', 'Story Books', 'School Bags'];

const productSchema = new mongoose.Schema({
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, enum: productCategories, index: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number, required: true, min: 0 },
  fastDelivery: { type: Boolean, default: false },
  smoothDelivery: { type: Boolean, default: false },
  stock: { type: Number, default: 0, min: 0 },
  brand: { type: String, default: '', trim: true, index: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  status: { type: Boolean, default: true, index: true }
}, { collection: 'products', timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
