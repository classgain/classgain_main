import User from '../model/studentloginModel.js';
import { extractBearerToken, verifyStudentToken } from '../utils/studentToken.js';

export async function requireStudent(req, res, next) {
  const payload = verifyStudentToken(extractBearerToken(req.headers.authorization || ''));
  if (!payload || payload.role !== 'student') return res.status(401).json({ success: false, message: 'Student login required.' });
  const user = await User.findById(payload.sub).select('-password');
  if (!user) return res.status(401).json({ success: false, message: 'Student session is no longer valid.' });
  req.student = user;
  return next();
}
