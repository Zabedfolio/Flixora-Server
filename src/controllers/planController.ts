import { Request, Response } from 'express';
import Plan from '../models/planModel';

const DEFAULT_PLANS = [
  {
    name: "Basic",
    price: "$7.99/mo",
    resolution: "720p (HD)",
    screens: "1 screen",
    downloads: "No downloads",
    ads: "Ad-supported",
    kids: "1 kids profile"
  },
  {
    name: "Standard",
    price: "$11.99/mo",
    resolution: "1080p (FHD)",
    screens: "2 screens",
    downloads: "Standard downloads",
    ads: "Ad-free",
    kids: "3 kids profiles"
  },
  {
    name: "Premium",
    price: "$14.99/mo",
    resolution: "4K + HDR",
    screens: "4 screens",
    downloads: "Unlimited downloads",
    ads: "Ad-free",
    kids: "Unlimited kids profiles"
  }
];

export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany(DEFAULT_PLANS);
    }

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
