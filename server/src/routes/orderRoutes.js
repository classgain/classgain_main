import { Router } from 'express';
import { createOrder, getMyOrder, listMyOrders } from '../controllers/orderController.js';
import { requireStudent } from '../middleware/counsellingAuth.js';
const router=Router();
router.post('/orders',requireStudent,createOrder);
router.get('/orders/my',requireStudent,listMyOrders);
router.get('/orders/:id',requireStudent,getMyOrder);
export default router;
