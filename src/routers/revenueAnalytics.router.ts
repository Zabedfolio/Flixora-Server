import { Router } from 'express';
import {
  getRevenueOverview,
  getPlanSubscribersBreakdown,
} from '../controllers/revenueAnalytics.controller';

const analyticsRouter = Router();

analyticsRouter.get('/analytics/revenue-overview', getRevenueOverview);
analyticsRouter.get('/analytics/subscribers-breakdown', getPlanSubscribersBreakdown);

export default analyticsRouter;
