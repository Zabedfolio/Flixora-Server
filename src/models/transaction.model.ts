import mongoose, { Document, Schema } from 'mongoose';

export type TransactionStatus = 'success' | 'failed' | 'refunded';

export interface ITransaction extends Document {
  stripeTransactionId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  planId?: mongoose.Types.ObjectId | string;
  planName?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  date: Date;
  invoiceId: string;
  paymentMethod: string;
  refundId?: string;
  refundReason?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    stripeTransactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    planId: {
      type: Schema.Types.Mixed,
      ref: 'Plan',
    },
    planName: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded'],
      default: 'success',
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: 'Card (Stripe)',
    },
    refundId: {
      type: String,
    },
    refundReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'transactions',
  }
);

// Indexes for fast search and aggregation
transactionSchema.index({ userEmail: 1, stripeTransactionId: 1 });
transactionSchema.index({ status: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema
);

export default Transaction;
