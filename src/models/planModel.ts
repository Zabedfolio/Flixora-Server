import { Schema, model, Document } from 'mongoose';

export type BillingCycle = 'monthly' | 'yearly';

export interface IPlan extends Document {
  name: string;
  slug?: string;
  price: string;
  monthlyPrice?: number;
  billingCycle: BillingCycle;
  resolution: string;
  videoQuality?: string;
  screens: string;
  maxScreens?: number;
  downloads: string;
  ads: string;
  kids: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyPrice: {
      type: Number,
      default: function (this: IPlan) {
        if (!this.price) return 0;
        const match = this.price.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      },
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    resolution: {
      type: String,
      required: true,
      trim: true,
    },
    videoQuality: {
      type: String,
      trim: true,
    },
    screens: {
      type: String,
      required: true,
      trim: true,
    },
    maxScreens: {
      type: Number,
      default: function (this: IPlan) {
        if (!this.screens) return 1;
        const match = this.screens.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1;
      },
    },
    downloads: {
      type: String,
      required: true,
      trim: true,
    },
    ads: {
      type: String,
      required: true,
      trim: true,
    },
    kids: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'plans',
  }
);

const Plan = model<IPlan>('Plan', planSchema);

export default Plan;
