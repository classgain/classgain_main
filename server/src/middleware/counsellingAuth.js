import User from '../model/studentloginModel.js';
import crypto from 'node:crypto';
import { extractBearerToken, verifyStudentToken } from '../utils/studentToken.js';

export async function requireStudent(req, res, next) {
  const payload = verifyStudentToken(extractBearerToken(req.headers.authorization || ''));
  if (!payload || payload.role !== 'student') return res.status(401).json({ success: false, message: 'Student login required.' });
  const user = await User.findById(payload.sub).select('-password');
  if (!user) return res.status(401).json({ success: false, message: 'Student session is no longer valid.' });
  req.student = user;
  return next();
}

export function requireAdmin(req, res, next) {
  const configuredKeys = [process.env.ADMIN_API_KEYS, process.env.ADMIN_API_KEY]
    .filter(Boolean).flatMap((value) => value.split(',')).map((value) => value.trim()).filter(Boolean);
  const suppliedKey = String(req.headers['x-admin-key'] || '').trim();
  const hasAccess = configuredKeys.some((configuredKey) => {
    const configuredBuffer = Buffer.from(configuredKey);
    const suppliedBuffer = Buffer.from(suppliedKey);
    return configuredBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(configuredBuffer, suppliedBuffer);
  });
  if (!hasAccess) {
    return res.status(401).json({ success: false, message: 'A valid employee access ID is required.' });
  }
  return next();
}
