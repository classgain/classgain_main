import crypto from 'node:crypto';
import EducationCenterSupportTicket from '../model/educationCenterHelpTicketModel.js';
import StudentSupportTicket from '../model/studentSupportTicketModel.js';

const models = { student: StudentSupportTicket, 'education-center': EducationCenterSupportTicket };
const getModel = (type) => models[type];

export async function createStudentTicket(req, res, next) {
  try {
    const studentName = String(req.body.studentName || req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const subject = String(req.body.subject || 'Student support request').trim();
    const message = String(req.body.message || req.body.question || '').trim();
    if (!studentName || !email || !subject || !message) return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required.' });
    const ticket = await StudentSupportTicket.create({ ticketId: `ST-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`, studentName, email, subject, message });
    res.status(201).json({ success: true, message: 'Support ticket submitted.', ticket });
  } catch (error) { next(error); }
}

export async function listTickets(req, res, next) {
  try {
    const Model = getModel(req.params.type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid ticket type.' });
    const items = await Model.find().sort({ createdAt: -1, created_at: -1 }).lean();
    res.json({ success: true, items });
  } catch (error) { next(error); }
}

export async function getTicketStatus(req, res, next) {
  try {
    const Model = getModel(req.params.type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid ticket type.' });

    const email = String(req.query.email || '').trim().toLowerCase();
    const ticketId = String(req.params.ticketId || '').trim();
    if (!email || !ticketId) {
      return res.status(400).json({ success: false, message: 'Ticket ID and email are required.' });
    }

    const ticketIdField = req.params.type === 'student' ? 'ticketId' : 'ticket_id';
    const ticket = await Model.findOne({ [ticketIdField]: ticketId, email })
      .select(`${ticketIdField} subject status reply createdAt created_at`)
      .lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'No support ticket matches this Ticket ID and email.' });
    }

    return res.json({
      success: true,
      ticket: {
        ticketId: ticket[ticketIdField],
        subject: ticket.subject,
        status: ticket.status,
        reply: ticket.reply || '',
        createdAt: ticket.createdAt || ticket.created_at
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateTicket(req, res, next) {
  try {
    const Model = getModel(req.params.type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid ticket type.' });
    const allowed = ['status', 'reply'];
    const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    const ticket = await Model.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.json({ success: true, message: 'Ticket updated.', ticket });
  } catch (error) { next(error); }
}

export async function deleteTicket(req, res, next) {
  try {
    const Model = getModel(req.params.type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid ticket type.' });
    const ticket = await Model.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.json({ success: true, message: 'Ticket deleted.' });
  } catch (error) { next(error); }
}
