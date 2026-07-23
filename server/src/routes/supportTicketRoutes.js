import { Router } from 'express';
import { createStudentTicket, deleteTicket, getTicketStatus, listTickets, updateTicket } from '../controllers/supportTicketController.js';
const router = Router();
router.post('/student', createStudentTicket);
router.get('/status/:type/:ticketId', getTicketStatus);
router.get('/admin/:type', listTickets);
router.patch('/admin/:type/:id', updateTicket);
router.delete('/admin/:type/:id', deleteTicket);
export default router;
