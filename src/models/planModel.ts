import { Schema, model, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: string;
  resolution: string;
  screens: string;
  downloads: string;
  ads: string;
  kids: string;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
    },
    resolution: {
      type: String,
      required: true,
    },
    screens: {
      type: String,
      required: true,
    },
    downloads: {
      type: String,
      required: true,
    },
    ads: {
      type: String,
      required: true,
    },
    kids: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'plans',
  },
);

const Plan = model<IPlan>('Plan', planSchema);

export default Plan;
