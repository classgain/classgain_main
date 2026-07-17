import mongoose from 'mongoose';

const studentSupportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  studentName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open', index: true },
  reply: { type: String, default: '', trim: true }
}, { collection: 'student_support_tickets', timestamps: true });

export default mongoose.models.StudentSupportTicket || mongoose.model('StudentSupportTicket', studentSupportTicketSchema);
