import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  movieId: string;
  movieTitle?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    movieId: { type: String, required: true, index: true },
    movieTitle: { type: String, default: 'Featured Movie' },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, default: '' },
    userAvatar: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
  },
  {
    collection: 'review',
    timestamps: true,
  }
);

// Compound index so each user can have one review per movie (or update it)
ReviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
