import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  processRefund,
} from '../controllers/transaction.controller';

const transactionRouter = Router();

transactionRouter.get('/transactions', getTransactions);
transactionRouter.get('/transactions/:id', getTransactionById);
transactionRouter.post('/transactions/:id/refund', processRefund);

export default transactionRouter;
