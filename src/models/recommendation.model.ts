import { Schema, model } from "mongoose";

const recommendationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    movieIds: {
      type: [Number],
      default: [],
    },

    preferences: {
      genres: {
        type: [String],
        default: [],
      },

      keywords: {
        type: [String],
        default: [],
      },
    },

    basedOn: {
      history: {
        type: [Number],
        default: [],
      },

      explored: {
        type: [Number],
        default: [],
      },

      saved: {
        type: [Number],
        default: [],
      },

      liked: {
        type: [Number],
        default: [],
      },
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Recommendation = model(
  "Recommendation",
  recommendationSchema
);