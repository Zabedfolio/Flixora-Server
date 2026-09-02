import { Router } from 'express';
import { getAllPlans } from '../controllers/planController';

const router = Router();

router.get('/plans', getAllPlans);
router.get('/', getAllPlans);

export default router;
