const Stripe = require('stripe');
import Transaction, { ITransaction } from '../models/transaction.model';

// Initialize Stripe if API key is present
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedTransactionsResponse {
  transactions: ITransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  summary: {
    totalRevenue: number;
    successfulCount: number;
    refundedCount: number;
    failedCount: number;
  };
}

export class TransactionService {
  /**
   * Fetch paginated transactions with search and status filters
   */
  public static async listTransactions(
    params: ListTransactionsParams
  ): Promise<PaginatedTransactionsResponse> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Status Filter (success | failed | refunded)
    if (params.status && params.status !== 'all') {
      const normalizedStatus = params.status.toLowerCase();
      if (['success', 'failed', 'refunded'].includes(normalizedStatus)) {
        filter.status = normalizedStatus;
      }
    }

    // Search by Stripe Transaction ID, User Email, User Name, or Invoice ID
    if (params.search && params.search.trim()) {
      const searchTerm = params.search.trim();
      filter.$or = [
        { stripeTransactionId: { $regex: searchTerm, $options: 'i' } },
        { userEmail: { $regex: searchTerm, $options: 'i' } },
        { userName: { $regex: searchTerm, $options: 'i' } },
        { invoiceId: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Optional Date Range filtering
    if (params.startDate || params.endDate) {
      filter.date = {};
      if (params.startDate) {
        (filter.date as Record<string, unknown>).$gte = new Date(params.startDate);
      }
      if (params.endDate) {
        (filter.date as Record<string, unknown>).$lte = new Date(params.endDate);
      }
    }

    const [transactions, total, summaryAggregate] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0],
              },
            },
            successfulCount: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
            },
            refundedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] },
            },
            failedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const summary = summaryAggregate[0] || {
      totalRevenue: 0,
      successfulCount: 0,
      refundedCount: 0,
      failedCount: 0,
    };

    return {
      transactions: transactions as ITransaction[],
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      summary: {
        totalRevenue: Number(summary.totalRevenue.toFixed(2)),
        successfulCount: summary.successfulCount,
        refundedCount: summary.refundedCount,
        failedCount: summary.failedCount,
      },
    };
  }

  /**
   * Get single transaction by ID or Stripe ID
   */
  public static async getTransactionById(id: string): Promise<ITransaction | null> {
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { stripeTransactionId: id }] }
      : { stripeTransactionId: id };

    return await Transaction.findOne(query);
  }

  /**
   * Process refund for a transaction via Stripe and update database
   */
  public static async processRefund(
    transactionId: string,
    reason: string = 'Requested by admin'
  ): Promise<ITransaction> {
    const query = transactionId.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: transactionId }, { stripeTransactionId: transactionId }] }
      : { stripeTransactionId: transactionId };

    const transaction = await Transaction.findOne(query);

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (transaction.status === 'refunded') {
      throw new Error('This transaction has already been refunded');
    }

    let stripeRefundId = `ref_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Call Stripe refund if configured and transaction ID resembles a real payment intent / charge
    if (stripe && transaction.stripeTransactionId && (transaction.stripeTransactionId.startsWith('pi_') || transaction.stripeTransactionId.startsWith('ch_'))) {
      try {
        const stripeRefund = await stripe.refunds.create({
          payment_intent: transaction.stripeTransactionId.startsWith('pi_')
            ? transaction.stripeTransactionId
            : undefined,
          charge: transaction.stripeTransactionId.startsWith('ch_')
            ? transaction.stripeTransactionId
            : undefined,
          reason: 'requested_by_customer',
        });
        stripeRefundId = stripeRefund.id;
      } catch (stripeErr: unknown) {
        const err = stripeErr as Error;
        console.warn('Stripe refund API call warning:', err.message);
      }
    }

    // Update Transaction status in MongoDB
    transaction.status = 'refunded';
    transaction.refundId = stripeRefundId;
    transaction.refundReason = reason;
    transaction.refundedAt = new Date();

    await transaction.save();

    return transaction;
  }
}

export default TransactionService;
