import { Schema, model } from "mongoose";

const movieActivitySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    genres: {
      type: [String],
      default: [],
      set: function (v: string[]) {
        return [...new Set(v)];
      },
    },
  },
  {
    timestamps: true,
  },
);

export const MovieActivity = model("MovieActivity", movieActivitySchema);
