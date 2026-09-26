import { Router } from 'express';
import { checkStatus } from '../controllers/statusController.js';

const router = Router();

router.get('/', checkStatus);

export default router;