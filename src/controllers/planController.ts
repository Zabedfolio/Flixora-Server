import { Request, Response } from 'express';
import Plan from '../models/planModel';

const DEFAULT_PLANS = [
  {
    name: "Basic",
    slug: "basic",
    price: "$7.99/mo",
    monthlyPrice: 7.99,
    billingCycle: "monthly",
    resolution: "720p (HD)",
    videoQuality: "720p (HD)",
    screens: "1 screen",
    maxScreens: 1,
    downloads: "No downloads",
    ads: "Ad-supported",
    kids: "1 kids profile",
    isActive: true,
  },
  {
    name: "Standard",
    slug: "standard",
    price: "$11.99/mo",
    monthlyPrice: 11.99,
    billingCycle: "monthly",
    resolution: "1080p (FHD)",
    videoQuality: "1080p (FHD)",
    screens: "2 screens",
    maxScreens: 2,
    downloads: "Standard downloads",
    ads: "Ad-free",
    kids: "3 kids profiles",
    isActive: true,
  },
  {
    name: "Premium",
    slug: "premium",
    price: "$14.99/mo",
    monthlyPrice: 14.99,
    billingCycle: "monthly",
    resolution: "4K + HDR",
    videoQuality: "4K + HDR",
    screens: "4 screens",
    maxScreens: 4,
    downloads: "Unlimited downloads",
    ads: "Ad-free",
    kids: "Unlimited kids profiles",
    isActive: true,
  }
];

/**
 * GET: Fetch all subscription plans (seeds defaults if empty)
 */
export const getAllPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany(DEFAULT_PLANS);
    }

    const plans = await Plan.find().sort({ monthlyPrice: 1 });

    res.status(200).json({
      success: true,
      message: 'Plans fetched successfully',
      data: plans,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get plans error:', err);

    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch plans',
    });
  }
};

/**
 * POST: Create a new subscription plan
 */
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      price,
      billingCycle,
      resolution,
      videoQuality,
      screens,
      maxScreens,
      downloads,
      ads,
      kids,
    } = req.body;

    if (!name || !price || !resolution) {
      res.status(400).json({
        success: false,
        message: 'Name, price, and resolution are required fields',
      });
      return;
    }

    const parsedPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 9.99;
    const resolvedSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const newPlan = new Plan({
      name,
      slug: resolvedSlug,
      price: price.startsWith('$') ? price : `$${price}`,
      monthlyPrice: parsedPrice,
      billingCycle: billingCycle || 'monthly',
      resolution,
      videoQuality: videoQuality || resolution,
      screens: screens || `${maxScreens || 1} screen`,
      maxScreens: Number(maxScreens) || 1,
      downloads: downloads || 'Standard downloads',
      ads: ads || 'Ad-supported',
      kids: kids || '1 kids profile',
      isActive: true,
    });

    const savedPlan = await newPlan.save();

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: savedPlan,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Create plan error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create plan',
    });
  }
};

/**
 * PUT: Update subscription plan pricing, billing cycle, or feature limits
 */
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updateData = { ...req.body };

    // Format price if updated
    if (updateData.price) {
      const parsedPrice = parseFloat(updateData.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedPrice)) {
        updateData.monthlyPrice = parsedPrice;
      }
      if (!updateData.price.startsWith('$')) {
        updateData.price = `$${updateData.price}`;
      }
    }

    if (updateData.maxScreens) {
      updateData.screens = `${updateData.maxScreens} screen${updateData.maxScreens > 1 ? 's' : ''}`;
    }

    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: updatedPlan,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Update plan error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update plan',
    });
  }
};

/**
 * DELETE: Delete a subscription plan
 */
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deletedPlan = await Plan.findByIdAndDelete(id);

    if (!deletedPlan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Delete plan error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete plan',
    });
  }
};
