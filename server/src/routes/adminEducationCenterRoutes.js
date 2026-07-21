import { Router } from 'express';
import {
  approveEducationCenter,
  deleteEducationCenter,
  getAdminEducationCenter,
  listAdminEducationCenters,
  rejectEducationCenter
} from '../controllers/educationCenterController.js';
import { requireAdmin } from '../middleware/counsellingAuth.js';

const router = Router();
router.use(requireAdmin);

router.get('/education-centers', listAdminEducationCenters);
router.get('/education-center/:id', getAdminEducationCenter);
router.patch('/education-center/:id/approve', approveEducationCenter);
router.patch('/education-center/:id/reject', rejectEducationCenter);
router.delete('/education-center/:id', deleteEducationCenter);

export default router;
