import express from 'express';
import { getCollectionNames } from '../controllers/databaseController.js';

const router = express.Router();

router.get('/collections', getCollectionNames);

export default router;
