import { Router } from 'express';
import {
  createEducationCenterHelpTicket,
  listApprovedEducationCenters,
  loginEducationCenter,
  registerEducationCenter
} from '../controllers/educationCenterController.js';

const router = Router();

router.get('/approved', listApprovedEducationCenters);
router.post('/help', createEducationCenterHelpTicket);
router.post('/login', loginEducationCenter);
router.post('/register', registerEducationCenter);

export default router;
