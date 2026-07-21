import { Router } from 'express';
import { createStudentTicket, deleteTicket, listTickets, updateTicket } from '../controllers/supportTicketController.js';
import { requireAdmin } from '../middleware/counsellingAuth.js';
const router = Router();
router.post('/student', createStudentTicket);
router.get('/admin/:type', requireAdmin, listTickets);
router.patch('/admin/:type/:id', requireAdmin, updateTicket);
router.delete('/admin/:type/:id', requireAdmin, deleteTicket);
export default router;
