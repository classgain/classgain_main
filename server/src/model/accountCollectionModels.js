import mongoose from 'mongoose';

const accountCollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    strict: false
  }
);

export const ClientCollection =
  mongoose.models.ClientCollection ||
  mongoose.model('ClientCollection', accountCollectionSchema, 'client');

export const SellerCollection =
  mongoose.models.SellerCollection ||
  mongoose.model('SellerCollection', accountCollectionSchema, 'seller');

export const AdminCollection =
  mongoose.models.AdminCollection ||
  mongoose.model('AdminCollection', accountCollectionSchema, 'admin');

export const accountCollections = [
  {
    key: 'client',
    model: ClientCollection
  },
  {
    key: 'seller',
    model: SellerCollection
  },
  {
    key: 'admin',
    model: AdminCollection
  }
];
