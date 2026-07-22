import { Router } from 'express';
import {
  approveEducationCenter,
  deleteEducationCenter,
  getAdminEducationCenter,
  holdEducationCenter,
  pendEducationCenter,
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
router.patch('/education-center/:id/hold', holdEducationCenter);
router.patch('/education-center/:id/pending', pendEducationCenter);
router.delete('/education-center/:id', deleteEducationCenter);

export default router;
