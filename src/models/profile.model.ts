import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: string;
  name: string;
  avatar: string;
}

const ProfileSchema: Schema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IProfile>('Profile', ProfileSchema);
