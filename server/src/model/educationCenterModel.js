import mongoose from 'mongoose';

export const educationCenterStatusValues = ['Pending', 'Approved', 'Rejected'];
export const educationCenterCategoryValues = ['School', 'College', 'Coaching Center'];

const educationCenterSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
      default: function defaultEducationCenterId() {
        return String(this._id);
      }
    },
    education_center_name: {
      type: String,
      required: true,
      trim: true
    },
    owner_name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: educationCenterCategoryValues,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    alternate_phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password_hash: {
      type: String,
      required: true
    },
    registration_certificate: {
      type: String,
      required: true
    },
    id_proof: {
      type: String,
      required: true
    },
    address_proof: {
      type: String,
      required: true
    },
    logo: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: educationCenterStatusValues,
      default: 'Pending',
      index: true
    }
  },
  {
    collection: 'education_centers',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

educationCenterSchema.index({
  education_center_name: 'text',
  owner_name: 'text',
  email: 'text',
  phone: 'text',
  username: 'text',
  city: 'text',
  state: 'text'
});
educationCenterSchema.index({ status: 1, category: 1, created_at: -1 });

const EducationCenter =
  mongoose.models.EducationCenter || mongoose.model('EducationCenter', educationCenterSchema);

export default EducationCenter;
