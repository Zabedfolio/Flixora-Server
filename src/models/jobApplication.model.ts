import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  experience: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'interviewing' | 'hired' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    experience: { type: String, required: true, default: 'Mid Level' },
    portfolioUrl: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interviewing', 'hired', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
