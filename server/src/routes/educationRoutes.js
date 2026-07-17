import { Router } from 'express';
import {
  createEducationApplication,
  getAllEducationCenters,
  getEducationByCategory,
  getEducationDetails
} from '../controllers/educationController.js';
import { requireStudent } from '../middleware/counsellingAuth.js';

const router = Router();

router.get('/', getAllEducationCenters);
router.get('/details/:itemId', getEducationDetails);
router.post('/details/:itemId/apply', requireStudent, createEducationApplication);
router.get('/:category', getEducationByCategory);

export default router;
