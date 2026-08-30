import { Request, Response } from 'express';
import Plan from '../models/planModel';

export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find();

    return res.status(200).json({
      success: true,
      message: 'Plans fetched successfully',
      data: plans,
    });
  } catch (error) {
    console.error('Get plans error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
    });
  }
};
