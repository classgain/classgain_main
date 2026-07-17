import mongoose from 'mongoose';

const educationItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['primary', 'secondary', 'extra', 'videos']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    address: {
      type: String,
      trim: true
    },
    image: String,
    profileImage: String,
    thumbnail: String,
    videoUrl: String,
    mediaType: String,
    badge: String,
    channel: String,
    duration: String,
    topic: String,
    courseCount: Number,
    courseList: String,
    contactEmail: String,
    phone: String,
    source: {
      type: String,
      default: 'mongodb'
    }
  },
  {
    timestamps: true
  }
);

const EducationItem =
  mongoose.models.EducationItem || mongoose.model('EducationItem', educationItemSchema);

export default EducationItem;
