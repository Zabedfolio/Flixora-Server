import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: string;
  planId: mongoose.Types.ObjectId;
  planName?: string;
  amount: string;
  invoiceId: string;
  status: 'Paid' | 'Failed';
  paymentMethod: string;
  stripeSessionId?: string;
  date: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: String, required: true },

    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    planName: { type: String },
    amount: { type: String, required: true },
    invoiceId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Paid', 'Failed'], default: 'Paid' },
    paymentMethod: { type: String, default: 'Card (Stripe)' },
    stripeSessionId: { type: String },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  { timestamps: true },
);

export const Payment = mongoose.model<IPayment>(
  'Payment',
  paymentSchema,
  'payments',
);
