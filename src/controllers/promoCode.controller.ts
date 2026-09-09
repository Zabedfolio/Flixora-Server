import { Request, Response } from 'express';
import PromoCodeService from '../services/promoCode.service';

/**
 * GET /api/promo-codes
 * Retrieve all promo codes
 */
export const getAllPromoCodes = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const promoCodes = await PromoCodeService.getAllPromoCodes();

    res.status(200).json({
      success: true,
      message: 'Promo codes retrieved successfully',
      data: promoCodes,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in getAllPromoCodes:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve promo codes',
    });
  }
};

/**
 * POST /api/promo-codes
 * Create a new promo code
 */
export const createPromoCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, discountPercentage, expirationDate, usageLimit } = req.body;

    if (!code || !discountPercentage || !expirationDate || !usageLimit) {
      res.status(400).json({
        success: false,
        message: 'Code, discountPercentage, expirationDate, and usageLimit are all required',
      });
      return;
    }

    const newPromo = await PromoCodeService.createPromoCode({
      code,
      discountPercentage: Number(discountPercentage),
      expirationDate,
      usageLimit: Number(usageLimit),
    });

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: newPromo,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in createPromoCode:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create promo code',
    });
  }
};

/**
 * DELETE /api/promo-codes/:id
 * Delete a promo code
 */
export const deletePromoCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await PromoCodeService.deletePromoCode(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Promo code not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in deletePromoCode:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete promo code',
    });
  }
};

/**
 * POST /api/promo-codes/validate
 * Validate a promo code string
 */
export const validatePromoCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.body;
    const validation = await PromoCodeService.validatePromoCode(code);

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: validation.message,
      data: {
        discountPercentage: validation.discountPercentage,
        code: validation.promoCode?.code,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in validatePromoCode:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to validate promo code',
    });
  }
};
