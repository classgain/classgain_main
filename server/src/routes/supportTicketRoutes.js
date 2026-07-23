import { Router } from 'express';
import { createStudentTicket, deleteTicket, listTickets, updateTicket } from '../controllers/supportTicketController.js';
const router = Router();
router.post('/student', createStudentTicket);
router.get('/admin/:type', listTickets);
router.patch('/admin/:type/:id', updateTicket);
router.delete('/admin/:type/:id', deleteTicket);
export default router;
