import { Router } from 'express';
import { getAllPlans } from '../controllers/planController';

const router = Router();

router.get('/', getAllPlans);
router.get('/plans', getAllPlans);

export default router;
