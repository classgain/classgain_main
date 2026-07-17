import Counselling from '../model/counsellingModel.js';
import Notification from '../model/notificationModel.js';

const allowedUpdates = ['status', 'priority', 'adminReply', 'adminNotes'];
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function createCounselling(req, res, next) {
  try {
    const required = ['studentId', 'name', 'email', 'phone', 'department', 'semester', 'category', 'subject', 'description'];
    const missing = required.find((key) => !String(req.body[key] || '').trim());
    if (missing) return res.status(400).json({ success: false, message: `${missing} is required.` });
    if (!/^\S+@\S+\.\S+$/.test(req.body.email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    if (!/^[+\d][\d\s-]{7,14}$/.test(req.body.phone)) return res.status(400).json({ success: false, message: 'Enter a valid phone number.' });
    const item = await Counselling.create({ ...req.body, studentObjectId: req.student._id, email: req.body.email.toLowerCase(), image: req.file ? `/uploads/counselling/${req.file.filename}` : '' });
    return res.status(201).json({ success: true, message: 'Counselling request submitted.', item });
  } catch (error) { return next(error); }
}

export async function listStudentCounselling(req, res, next) {
  try {
    const items = await Counselling.find({ studentObjectId: req.student._id }).sort({ createdAt: -1 });
    return res.json({ success: true, items });
  } catch (error) { return next(error); }
}

export async function getStudentCounselling(req, res, next) {
  try {
    const item = await Counselling.findOne({ _id: req.params.id, studentObjectId: req.student._id });
    if (!item) return res.status(404).json({ success: false, message: 'Counselling request not found.' });
    return res.json({ success: true, item });
  } catch (error) { return next(error); }
}

export async function updateStudentCounselling(req, res, next) {
  try {
    const item = await Counselling.findOne({ _id: req.params.id, studentObjectId: req.student._id });
    if (!item) return res.status(404).json({ success: false, message: 'Counselling request not found.' });
    if (['Resolved', 'Closed'].includes(item.status)) return res.status(409).json({ success: false, message: 'Resolved or closed requests cannot be edited.' });
    ['phone', 'department', 'semester', 'category', 'subject', 'description'].forEach((key) => { if (req.body[key] !== undefined) item[key] = req.body[key]; });
    await item.save();
    return res.json({ success: true, message: 'Counselling request updated.', item });
  } catch (error) { return next(error); }
}

export async function deleteStudentCounselling(req, res, next) {
  try {
    const item = await Counselling.findOne({ _id: req.params.id, studentObjectId: req.student._id });
    if (!item) return res.status(404).json({ success: false, message: 'Counselling request not found.' });
    if (['Resolved', 'Closed'].includes(item.status)) return res.status(409).json({ success: false, message: 'Resolved or closed requests cannot be deleted.' });
    await item.deleteOne();
    return res.json({ success: true, message: 'Counselling request deleted.' });
  } catch (error) { return next(error); }
}

export async function listAdminCounselling(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const filter = {};
    ['status', 'department', 'category', 'priority'].forEach((key) => { if (req.query[key]) filter[key] = req.query[key]; });
    if (req.query.search) { const value = new RegExp(escapeRegex(req.query.search), 'i'); filter.$or = [{ name: value }, { studentId: value }, { department: value }, { category: value }, { subject: value }]; }
    if (req.query.date) { const start = new Date(req.query.date); const end = new Date(start); end.setDate(end.getDate() + 1); filter.createdAt = { $gte: start, $lt: end }; }
    const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const [items, total, counts] = await Promise.all([Counselling.find(filter).sort(sort).skip((page - 1) * limit).limit(limit), Counselling.countDocuments(filter), Counselling.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])]);
    return res.json({ success: true, items, counts: Object.fromEntries(counts.map((x) => [x._id, x.count])), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
}

export async function getAdminCounselling(req, res, next) {
  try { const item = await Counselling.findById(req.params.id); if (!item) return res.status(404).json({ success: false, message: 'Counselling request not found.' }); return res.json({ success: true, item }); } catch (error) { return next(error); }
}

export async function updateAdminCounselling(req, res, next) {
  try {
    const item = await Counselling.findById(req.params.id); if (!item) return res.status(404).json({ success: false, message: 'Counselling request not found.' });
    const changed = [];
    allowedUpdates.forEach((key) => { if (req.body[key] !== undefined && req.body[key] !== item[key]) { item[key] = req.body[key]; changed.push(key); } });
    await item.save();
    if (changed.length) await Notification.create({ studentId: item.studentObjectId, title: changed.includes('adminReply') ? 'Counselling reply received' : 'Counselling request updated', message: changed.includes('status') ? `Your counselling request status is now ${item.status}.` : 'Your counselling request has a new update.', link: `/student/my-counselling?id=${item._id}` });
    return res.json({ success: true, message: 'Counselling request updated.', item });
  } catch (error) { return next(error); }
}

export async function deleteAdminCounselling(req, res, next) { try { const item = await Counselling.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ success: false, message: 'Counselling request not found.' }); return res.json({ success: true, message: 'Counselling request deleted.' }); } catch (error) { return next(error); } }

export async function listNotifications(req, res, next) { try { const items = await Notification.find({ studentId: req.student._id }).sort({ createdAt: -1 }).limit(50); return res.json({ success: true, items, unread: items.filter((x) => !x.isRead).length }); } catch (error) { return next(error); } }
export async function readNotification(req, res, next) { try { const item = await Notification.findOneAndUpdate({ _id: req.params.id, studentId: req.student._id }, { isRead: true }, { new: true }); if (!item) return res.status(404).json({ success: false, message: 'Notification not found.' }); return res.json({ success: true, item }); } catch (error) { return next(error); } }
