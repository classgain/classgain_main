import express from 'express';
import {
  addStudentCollectionItem,
  deleteStudentCollectionItem,
  getStudentDashboard,
  loginUser,
  registerUser,
  updateStudentCollectionItem,
  updateStudentProfile
} from '../controllers/studentlogincontroler.js';

const router = express.Router();

router.get('/dashboard', getStudentDashboard);
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.patch('/profile', updateStudentProfile);
router.post('/profile', updateStudentProfile);
router.post('/:collection', addStudentCollectionItem);
router.patch('/:collection/:itemId', updateStudentCollectionItem);
router.put('/:collection/:itemId', updateStudentCollectionItem);
router.delete('/:collection/:itemId', deleteStudentCollectionItem);

export default router;
