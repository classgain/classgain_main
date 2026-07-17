import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    },
    intake: {
      type: Number,
      default: 0
    },
    fee: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  { _id: false }
);

const scholarshipSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      trim: true
    },
    eligibility: {
      type: String,
      trim: true
    },
    benefit: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    studentObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    id: {
      type: String,
      required: true,
      trim: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ['New', 'Under Review', 'Accepted', 'Rejected'],
      default: 'New'
    },
    appliedOn: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    currentStudy: {
      type: String,
      trim: true
    },
    completedStudy: {
      type: String,
      trim: true
    },
    completedStudyPercentage: {
      type: String,
      trim: true
    },
    previousEducation: {
      type: String,
      trim: true
    },
    marks: {
      type: String,
      trim: true
    },
    scholarshipInterest: {
      type: Boolean,
      default: false
    },
    scholarshipName: {
      type: String,
      trim: true
    },
    statement: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    reply: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const galleryImageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const videoItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    videoUrl: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const educationCenterUploadSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationPartner'
    },
    categoryKey: {
      type: String,
      required: true,
      enum: ['primary', 'secondary', 'extra'],
      trim: true
    },
    image: String,
    profileImage: String,
    educationCenterName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    courseType: {
      type: String,
      required: true,
      enum: ['Starting Education', 'Higher Education', 'Additional Education'],
      trim: true
    },
    courseCount: {
      type: Number,
      required: true
    },
    courseList: String,
    description: String,
    promoVideoUrl: String,
    contactEmail: String,
    phone: String,
    courses: {
      type: [courseSchema],
      default: []
    },
    scholarships: {
      type: [scholarshipSchema],
      default: []
    },
    applications: {
      type: [applicationSchema],
      default: []
    },
    galleryImages: {
      type: [galleryImageSchema],
      default: []
    },
    videoItems: {
      type: [videoItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const EducationCenterUpload =
  mongoose.models.EducationCenterUpload || mongoose.model('EducationCenterUpload', educationCenterUploadSchema);

export default EducationCenterUpload;
