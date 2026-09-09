import { Request, Response } from 'express';
import TransactionService from '../services/transaction.service';

/**
 * GET /api/transactions
 * Retrieve paginated transactions with search and status filters
 */
export const getTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, search, status, startDate, endDate } = req.query;

    const result = await TransactionService.listTransactions({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.transactions,
      pagination: result.pagination,
      summary: result.summary,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in getTransactions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve transactions',
    });
  }
};

/**
 * GET /api/transactions/:id
 * Retrieve a single transaction by ID or Stripe Transaction ID
 */
export const getTransactionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const transaction = await TransactionService.getTransactionById(id);

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction',
    });
  }
};

/**
 * POST /api/transactions/:id/refund
 * Process a refund through Stripe and update the transaction status
 */
export const processRefund = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { reason } = req.body;

    const refundedTransaction = await TransactionService.processRefund(
      id,
      reason || 'Customer requested refund'
    );

    res.status(200).json({
      success: true,
      message: 'Transaction refunded successfully',
      data: refundedTransaction,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error processing refund:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process refund',
    });
  }
};
