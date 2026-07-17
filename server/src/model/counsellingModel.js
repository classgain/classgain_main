import mongoose from 'mongoose';

const counsellingSchema = new mongoose.Schema({
  studentId: { type: String, required: true, trim: true, index: true },
  studentObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true, index: true },
  semester: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], default: 'Pending', index: true },
  adminReply: { type: String, default: '', trim: true },
  adminNotes: { type: String, default: '', trim: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium', index: true }
}, { timestamps: true });

export default mongoose.models.Counselling || mongoose.model('Counselling', counsellingSchema);
