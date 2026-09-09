import { Router } from 'express';
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController';

const router = Router();

// Public & Admin Read
router.get('/plans', getAllPlans);
router.get('/', getAllPlans);

// Admin Plan Settings CRUD
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

export default router;
