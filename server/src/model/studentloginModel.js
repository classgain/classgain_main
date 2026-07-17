import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dateLabel: {
      type: String,
      trim: true
    },
    accent: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    dateLabel: {
      type: String,
      trim: true
    },
    accent: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    excerpt: {
      type: String,
      trim: true
    },
    timeLabel: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    provider: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      trim: true
    },
    dateLabel: {
      type: String,
      trim: true
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const friendSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    handle: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    relation: {
      type: String,
      default: 'following',
      trim: true
    }
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      trim: true
    },
    memberCount: {
      type: Number,
      default: 1
    },
    lastMessage: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    mediaType: {
      type: String,
      default: 'video',
      trim: true
    },
    mediaUrl: {
      type: String,
      trim: true
    },
    timeLabel: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const applicationStatusSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      trim: true
    },
    college: {
      type: String,
      trim: true
    },
    course: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      trim: true
    },
    updatedLabel: {
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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      default: ''
    },
    tagline: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    achievementCount: {
      type: Number,
      default: 0
    },
    certificateCount: {
      type: Number,
      default: 0
    },
    subjectCount: {
      type: Number,
      default: 0
    },
    achievements: {
      type: [achievementSchema],
      default: []
    },
    certificates: {
      type: [certificateSchema],
      default: []
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    completedCourses: {
      type: [courseSchema],
      default: []
    },
    currentStudies: {
      type: [courseSchema],
      default: []
    },
    friends: {
      type: [friendSchema],
      default: []
    },
    friendSuggestions: {
      type: [friendSchema],
      default: []
    },
    groups: {
      type: [groupSchema],
      default: []
    },
    stories: {
      type: [storySchema],
      default: []
    },
    applicationStatuses: {
      type: [applicationStatusSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
