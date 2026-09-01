import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylistMovie {
  movieId: string;
  title: string;
  unsplash_url?: string;
  year?: string;
  duration?: string;
  category?: string;
  addedAt?: Date;
}

export interface IPlaylist extends Document {
  userId?: string;
  userIds?: string[];
  isPreCreated?: boolean;
  name: string;
  tag?: string;
  description?: string;
  isPublic: boolean;
  movies: IPlaylistMovie[];
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistMovieSchema: Schema = new Schema({
  movieId: { type: String, required: true },
  title: { type: String, required: true },
  unsplash_url: { type: String, default: '' },
  year: { type: String, default: '' },
  duration: { type: String, default: '' },
  category: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const PlaylistSchema: Schema = new Schema({
  userId: { type: String, index: true },
  userIds: { type: [String], default: [], index: true },
  isPreCreated: { type: Boolean, default: false, index: true },
  name: { type: String, required: true },
  tag: { type: String, default: 'Custom' },
  description: { type: String, default: '' },
  isPublic: { type: Boolean, default: true },
  movies: { type: [PlaylistMovieSchema], default: [] }
}, {
  collection: 'playlist',
  timestamps: true
});

export default mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
