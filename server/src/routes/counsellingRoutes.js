import { Router } from 'express';
import multer from 'multer';
import { createCounselling, deleteAdminCounselling, deleteStudentCounselling, getAdminCounselling, getStudentCounselling, listAdminCounselling, listNotifications, listStudentCounselling, readNotification, updateAdminCounselling, updateStudentCounselling } from '../controllers/counsellingController.js';
import { requireStudent } from '../middleware/counsellingAuth.js';
import { isSupportedImageFile, unsupportedImageError } from '../utils/imageFiles.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const supported = isSupportedImageFile(file);
    cb(supported ? null : unsupportedImageError(), supported);
  }
});
const router = Router();
router.post('/counselling', requireStudent, upload.single('image'), createCounselling);
router.get('/counselling', requireStudent, listStudentCounselling);
router.get('/counselling/:id', requireStudent, getStudentCounselling);
router.put('/counselling/:id', requireStudent, updateStudentCounselling);
router.delete('/counselling/:id', requireStudent, deleteStudentCounselling);
router.get('/admin/counselling', listAdminCounselling);
router.get('/admin/counselling/:id', getAdminCounselling);
router.put('/admin/counselling/:id', updateAdminCounselling);
router.patch('/admin/counselling/:id', updateAdminCounselling);
router.delete('/admin/counselling/:id', deleteAdminCounselling);
router.get('/notifications', requireStudent, listNotifications);
router.patch('/notifications/:id/read', requireStudent, readNotification);
export default router;
