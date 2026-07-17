import mongoose from 'mongoose';

const videoUploaderChannelSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationPartner'
    },
    bannerImage: String,
    profileImage: String,
    channelName: {
      type: String,
      required: true,
      trim: true
    },
    ownerName: {
      type: String,
      required: true,
      trim: true
    },
    channelDescription: String,
    videoCategory: {
      type: String,
      required: true,
      trim: true
    },
    uploadCount: {
      type: Number,
      default: 0
    },
    totalWatchMembers: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    boosterPlan: {
      type: String,
      default: 'Starter Boost'
    },
    introVideoUrl: {
      type: String,
      required: true,
      trim: true
    },
    reelsVideoUrl: String,
    uploadedVideos: String,
    allowDelete: {
      type: Boolean,
      default: true
    },
    contactEmail: String
  },
  {
    timestamps: true
  }
);

const VideoUploaderChannel =
  mongoose.models.VideoUploaderChannel || mongoose.model('VideoUploaderChannel', videoUploaderChannelSchema);

export default VideoUploaderChannel;
