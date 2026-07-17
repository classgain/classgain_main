import mongoose from 'mongoose';
import { educationCenterCategoryValues } from './educationCenterModel.js';

const complaintTypeValues = [
  'Technical Issue',
  'Account Issue',
  'Payment Issue',
  'General Inquiry',
  'Other'
];

const educationCenterHelpTicketSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
      default: function defaultEducationCenterHelpTicketId() {
        return String(this._id);
      }
    },
    ticket_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    education_center_name: {
      type: String,
      required: true,
      trim: true
    },
    owner_name: { type: String, trim: true, default: '' },
    category: {
      type: String,
      required: true,
      enum: educationCenterCategoryValues,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    complaint_type: {
      type: String,
      required: true,
      enum: complaintTypeValues,
      trim: true
    },
    how_can_we_help: {
      type: String,
      required: true,
      trim: true
    },
    full_details: {
      type: String,
      required: true,
      trim: true
    },
    attachment: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Open', 'In Progress', 'Closed'],
      default: 'Open',
      index: true
    },
    reply: { type: String, trim: true, default: '' }
  },
  {
    collection: 'education_center_help_tickets',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false
    }
  }
);

const EducationCenterHelpTicket =
  mongoose.models.EducationCenterHelpTicket ||
  mongoose.model('EducationCenterHelpTicket', educationCenterHelpTicketSchema);

export default EducationCenterHelpTicket;
