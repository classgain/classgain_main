import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  studentObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true, trim: true },
  productImage: { type: String, default: '' },
  quantity: { type: Number, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  customer: {
    name: { type: String, required: true, trim: true }, email: { type: String, required: true, trim: true, lowercase: true }, phone: { type: String, required: true, trim: true }
  },
  address: { type: String, required: true, trim: true },
  paymentMode: { type: String, enum: ['COD', 'UPI', 'Card'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Order Confirmed', index: true }
}, { timestamps: true });
export default mongoose.models.Order || mongoose.model('Order', orderSchema);
