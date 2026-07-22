import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import {
  createEducationCenterHelpTicket,
  listApprovedEducationCenters,
  loginEducationCenter,
  registerEducationCenter
} from '../controllers/educationCenterController.js';

const router = Router();
const registrationDirectory = path.resolve(process.env.UPLOAD_DIR || 'uploads', 'education-center-registration');
fs.mkdirSync(registrationDirectory, { recursive: true });
const registrationUpload = multer({
  storage: multer.diskStorage({
    destination: registrationDirectory,
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-')}`)
  }),
  limits: { fileSize: 100 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, callback) => {
    const allowed = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
    callback(allowed ? null : new Error('Registration files must be an image or PDF.'), allowed);
  }
});

router.get('/approved', listApprovedEducationCenters);
router.post('/help', createEducationCenterHelpTicket);
router.post('/login', loginEducationCenter);
router.post('/register', registrationUpload.fields([
  { name: 'registrationCertificate', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), registerEducationCenter);

export default router;
