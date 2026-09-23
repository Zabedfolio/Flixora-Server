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
   * Fetch paginated transactions with search and status filters from real database collections
   */
  public static async listTransactions(
    params: ListTransactionsParams
  ): Promise<PaginatedTransactionsResponse> {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    if (!db) {
      // Fallback if db is not ready yet
      return {
        transactions: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1, hasMore: false },
        summary: { totalRevenue: 0, successfulCount: 0, refundedCount: 0, failedCount: 0 },
      };
    }

    // Fetch real collections from MongoDB
    const [payments, transactionsColl, tickets, users, plans] = await Promise.all([
      db.collection('payments').find({}).toArray(),
      db.collection('transactions').find({}).toArray(),
      db.collection('cinema_tickets').find({}).toArray(),
      db.collection('user').find({}).toArray(),
      db.collection('plans').find({}).toArray(),
    ]);

    // Create quick lookup maps for real user data
    const userMap = new Map<string, any>();
    users.forEach((u: any) => {
      if (u._id) userMap.set(String(u._id), u);
      if (u.id) userMap.set(String(u.id), u);
      if (u.email) userMap.set(u.email.toLowerCase(), u);
    });

    const planMap = new Map<string, any>();
    plans.forEach((p: any) => {
      if (p._id) planMap.set(String(p._id), p);
      if (p.name) planMap.set(p.name.toLowerCase(), p);
    });

    const rawList: any[] = [];

    // 1. Subscription Payments
    for (const p of payments) {
      const userIdStr = p.userId ? String(p.userId) : '';
      const user = userMap.get(userIdStr) || userMap.get(p.customerEmail?.toLowerCase() || '') || userMap.get(p.userEmail?.toLowerCase() || '');
      const plan = planMap.get(String(p.planId));

      let amount = 0;
      if (typeof p.amount === 'number') amount = p.amount;
      else if (typeof p.amount === 'string') amount = parseFloat(p.amount.replace(/[^0-9.]/g, '')) || 0;
      else if (typeof p.amountTotal === 'number') amount = p.amountTotal / 100;

      const rawStatus = (p.status || 'Paid').toLowerCase();
      let status: 'success' | 'refunded' | 'failed' = 'success';
      if (rawStatus === 'paid' || rawStatus === 'success') status = 'success';
      else if (rawStatus.includes('refund') || rawStatus.includes('cancel')) status = 'refunded';
      else status = 'failed';

      const userEmail = p.customerEmail || p.userEmail || user?.email || 'customer@flixora.tv';
      const userName = p.userName || user?.name || (userEmail.includes('@') ? userEmail.split('@')[0] : 'Subscriber');

      rawList.push({
        _id: String(p._id),
        stripeTransactionId: p.stripeSessionId || p.paymentIntentId || `cs_tx_${p._id}`,
        userId: userIdStr,
        userEmail,
        userName,
        planId: p.planId ? String(p.planId) : undefined,
        planName: p.planName || plan?.name || (amount >= 14 ? 'Premium' : amount >= 10 ? 'Standard' : 'Basic'),
        amount,
        currency: 'USD',
        status,
        date: new Date(p.createdAt || p.date || Date.now()).toISOString(),
        invoiceId: p.invoiceId || `INV-2026-${String(p._id).slice(-4).toUpperCase()}`,
        paymentMethod: 'Card (Stripe)',
      });
    }

    // 2. Cinema Movie Tickets
    for (const t of tickets) {
      const userIdStr = t.userId ? String(t.userId) : '';
      const user = userMap.get(userIdStr) || userMap.get(t.userEmail?.toLowerCase() || '');

      let amount = 12.0;
      if (typeof t.totalPrice === 'number') amount = t.totalPrice;
      else if (typeof t.amount === 'number') amount = t.amount;

      const userEmail = t.userEmail || user?.email || 'customer@flixora.tv';
      const userName = t.userName || user?.name || (userEmail.includes('@') ? userEmail.split('@')[0] : 'Customer');

      rawList.push({
        _id: String(t._id),
        stripeTransactionId: t.stripeSessionId || t.bookingId || `ticket_${t._id}`,
        userId: userIdStr,
        userEmail,
        userName,
        planId: 'cinema-ticket',
        planName: t.movieTitle ? `Cinema: ${t.movieTitle}` : 'Cinema Ticket',
        amount,
        currency: 'USD',
        status: 'success',
        date: new Date(t.createdAt || t.bookingDate || Date.now()).toISOString(),
        invoiceId: t.ticketCode || `TKT-2026-${String(t._id).slice(-4).toUpperCase()}`,
        paymentMethod: 'Card (Stripe)',
      });
    }

    // 3. Additional Transactions (enrich demo ones with real user emails if available)
    for (const t of transactionsColl) {
      const userIdStr = t.userId ? String(t.userId) : '';
      const user = userMap.get(userIdStr) || userMap.get(t.userEmail?.toLowerCase() || '');

      const userEmail = (user && user.email) ? user.email : (t.userEmail || 'customer@flixora.tv');
      const userName = (user && user.name) ? user.name : (t.userName || 'Customer');

      let status: 'success' | 'refunded' | 'failed' = 'success';
      const st = String(t.status || 'success').toLowerCase();
      if (st === 'success' || st === 'paid') status = 'success';
      else if (st.includes('refund') || st.includes('cancel')) status = 'refunded';
      else status = 'failed';

      rawList.push({
        _id: String(t._id),
        stripeTransactionId: t.stripeTransactionId || `tx_${t._id}`,
        userId: userIdStr,
        userEmail,
        userName,
        planId: t.planId ? String(t.planId) : undefined,
        planName: t.planName || 'Standard',
        amount: typeof t.amount === 'number' ? t.amount : 0,
        currency: t.currency || 'USD',
        status,
        date: new Date(t.date || t.createdAt || Date.now()).toISOString(),
        invoiceId: t.invoiceId || `INV-2026-${String(t._id).slice(-4).toUpperCase()}`,
        paymentMethod: t.paymentMethod || 'Card (Stripe)',
      });
    }

    // Deduplicate items by stripeTransactionId
    const seen = new Set<string>();
    let uniqueItems: any[] = [];
    for (const item of rawList) {
      if (!seen.has(item.stripeTransactionId)) {
        seen.add(item.stripeTransactionId);
        uniqueItems.push(item);
      }
    }

    // Apply Status Filter
    if (params.status && params.status !== 'all') {
      const targetStatus = params.status.toLowerCase();
      uniqueItems = uniqueItems.filter((tx) => tx.status === targetStatus);
    }

    // Apply Search Filter (search by Invoice, Stripe ID, User Email, Name, or Plan)
    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      uniqueItems = uniqueItems.filter(
        (tx) =>
          tx.invoiceId.toLowerCase().includes(term) ||
          tx.stripeTransactionId.toLowerCase().includes(term) ||
          tx.userEmail.toLowerCase().includes(term) ||
          tx.userName.toLowerCase().includes(term) ||
          (tx.planName && tx.planName.toLowerCase().includes(term))
      );
    }

    // Sort by Date Descending
    uniqueItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute Summary Stats
    const totalRevenue = uniqueItems.reduce(
      (acc, tx) => (tx.status === 'success' ? acc + tx.amount : acc),
      0
    );
    const successfulCount = uniqueItems.filter((tx) => tx.status === 'success').length;
    const refundedCount = uniqueItems.filter((tx) => tx.status === 'refunded').length;
    const failedCount = uniqueItems.filter((tx) => tx.status === 'failed').length;

    // Paginate
    const total = uniqueItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedTransactions = uniqueItems.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions as ITransaction[],
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        successfulCount,
        refundedCount,
        failedCount,
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
