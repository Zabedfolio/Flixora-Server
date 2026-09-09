import PromoCode, { IPromoCode } from '../models/promoCode.model';

export interface CreatePromoCodeDTO {
  code: string;
  discountPercentage: number;
  expirationDate: Date | string;
  usageLimit: number;
}

export interface PromoCodeValidationResult {
  valid: boolean;
  message: string;
  discountPercentage?: number;
  promoCode?: IPromoCode;
}

export class PromoCodeService {
  /**
   * Seed initial promo codes if empty
   */
  public static async ensureSeedData(): Promise<void> {
    try {
      const count = await PromoCode.countDocuments();
      if (count === 0) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 3);

        const endOfYear = new Date(new Date().getFullYear(), 11, 31);

        await PromoCode.insertMany([
          {
            code: 'FLIX25',
            discountPercentage: 25,
            expirationDate: nextMonth,
            usageLimit: 250,
            usedCount: 42,
            isActive: true,
          },
          {
            code: 'WELCOME50',
            discountPercentage: 50,
            expirationDate: endOfYear,
            usageLimit: 100,
            usedCount: 18,
            isActive: true,
          },
          {
            code: 'STREAM10',
            discountPercentage: 10,
            expirationDate: nextMonth,
            usageLimit: 500,
            usedCount: 110,
            isActive: true,
          },
        ]);
      }
    } catch (err) {
      console.error('Error seeding promo codes:', err);
    }
  }

  /**
   * List all promo codes with usage and status
   */
  public static async getAllPromoCodes(): Promise<IPromoCode[]> {
    await this.ensureSeedData();
    return await PromoCode.find().sort({ createdAt: -1 });
  }

  /**
   * Create a new promo code
   */
  public static async createPromoCode(
    data: CreatePromoCodeDTO
  ): Promise<IPromoCode> {
    const formattedCode = data.code.trim().toUpperCase();

    const existing = await PromoCode.findOne({ code: formattedCode });
    if (existing) {
      throw new Error(`Promo code '${formattedCode}' already exists`);
    }

    const expDate = new Date(data.expirationDate);
    if (isNaN(expDate.getTime())) {
      throw new Error('Invalid expiration date format');
    }

    if (data.discountPercentage < 1 || data.discountPercentage > 100) {
      throw new Error('Discount percentage must be between 1 and 100');
    }

    if (data.usageLimit < 1) {
      throw new Error('Usage limit must be at least 1');
    }

    const promo = new PromoCode({
      code: formattedCode,
      discountPercentage: Number(data.discountPercentage),
      expirationDate: expDate,
      usageLimit: Number(data.usageLimit),
      usedCount: 0,
      isActive: true,
    });

    return await promo.save();
  }

  /**
   * Delete or deactivate promo code
   */
  public static async deletePromoCode(id: string): Promise<boolean> {
    const result = await PromoCode.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Validate promo code for checkout or redemption
   */
  public static async validatePromoCode(
    code: string
  ): Promise<PromoCodeValidationResult> {
    if (!code) {
      return { valid: false, message: 'Promo code is required' };
    }

    const promo = await PromoCode.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!promo) {
      return { valid: false, message: 'Promo code is invalid' };
    }

    if (!promo.isActive) {
      return { valid: false, message: 'This promo code is no longer active' };
    }

    if (new Date() > promo.expirationDate) {
      return { valid: false, message: 'This promo code has expired' };
    }

    if (promo.usedCount >= promo.usageLimit) {
      return { valid: false, message: 'This promo code has reached its usage limit' };
    }

    return {
      valid: true,
      message: `${promo.discountPercentage}% discount applied successfully!`,
      discountPercentage: promo.discountPercentage,
      promoCode: promo,
    };
  }
}

export default PromoCodeService;
