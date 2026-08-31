import { Router } from 'express';
import {
  postPaymentData,
  getPaymentHistory,
} from '../controllers/paymentController';

const paymentRouter = Router();

// post payment
paymentRouter.post('/payments/success', postPaymentData);

//  get payment data
paymentRouter.get('/payments/history/:userId', getPaymentHistory);

export default paymentRouter;
