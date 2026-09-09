import { Request, Response } from 'express';
import RevenueAnalyticsService from '../services/revenueAnalytics.service';

/**
 * GET /api/analytics/revenue-overview
 * Returns MRR, ARR, active subscribers per plan, churn rate, growth, and timeline for charts
 */
export const getRevenueOverview = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await RevenueAnalyticsService.getRevenueOverview();

    res.status(200).json({
      success: true,
      message: 'Revenue overview retrieved successfully',
      data,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error fetching revenue overview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch revenue analytics',
    });
  }
};

/**
 * GET /api/analytics/subscribers-breakdown
 * Returns active subscribers by plan (Basic, Standard, Premium)
 */
export const getPlanSubscribersBreakdown = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const overview = await RevenueAnalyticsService.getRevenueOverview();

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers: overview.totalSubscribers,
        planBreakdown: overview.planBreakdown,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch plan subscribers breakdown',
    });
  }
};
