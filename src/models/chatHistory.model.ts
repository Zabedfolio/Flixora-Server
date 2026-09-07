import { Schema, model, Document } from "mongoose";

export interface IRecommendedMovie {
  id: string;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  posterUrl: string;
  overview?: string;
}

export interface IChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  movies?: IRecommendedMovie[];
}

export interface IChatHistory extends Document {
  sessionId: string;
  userId?: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IRecommendedMovie>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    year: { type: Number, default: 2026 },
    rating: { type: Number, default: 8.0 },
    genres: { type: [String], default: [] },
    posterUrl: { type: String, default: "" },
    overview: { type: String, default: "" },
  },
  { _id: false }
);

const messageSchema = new Schema<IChatMessage>(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    movies: { type: [movieSchema], default: undefined },
  },
  { _id: false }
);

const chatHistorySchema = new Schema<IChatHistory>(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export const ChatHistory = model<IChatHistory>(
  "ChatHistory",
  chatHistorySchema
);
