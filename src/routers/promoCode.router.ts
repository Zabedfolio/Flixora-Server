import { Router } from 'express';
import {
  getAllPromoCodes,
  createPromoCode,
  deletePromoCode,
  validatePromoCode,
} from '../controllers/promoCode.controller';

const promoCodeRouter = Router();

promoCodeRouter.get('/promo-codes', getAllPromoCodes);
promoCodeRouter.post('/promo-codes', createPromoCode);
promoCodeRouter.delete('/promo-codes/:id', deletePromoCode);
promoCodeRouter.post('/promo-codes/validate', validatePromoCode);

export default promoCodeRouter;
