import mongoose from 'mongoose';

const educationPartnerSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['education-center', 'video-uploader'],
      required: true
    },
    organizationName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    governmentCode: {
      type: String,
      required: true,
      trim: true
    },
    officialEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    educationCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationCenter'
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const EducationPartner =
  mongoose.models.EducationPartner || mongoose.model('EducationPartner', educationPartnerSchema);

export default EducationPartner;
