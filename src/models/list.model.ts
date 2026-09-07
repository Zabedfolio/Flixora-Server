import mongoose, { Schema, Document } from 'mongoose';

export interface IList extends Document {
  userId: string;
  movieId: string;
  title: string;
  year?: string;
  duration?: string;
  category?: string;
  unsplash_url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    movieId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    year: { type: String, default: '' },
    duration: { type: String, default: '' },
    category: { type: String, default: 'Movie' },
    unsplash_url: { type: String, default: '' },
  },
  {
    collection: 'Lists',
    timestamps: true,
  }
);

// Compound index so each user can have each movie in their list once
ListSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const List = mongoose.models.List || mongoose.model<IList>('List', ListSchema);
