const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    isActive: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true },
    value: { type: Number, min: 1, max: 5, required: true }
  },
  { _id: false, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    favorites: [{ type: Number }],
    watchLater: [{ type: Number }],
    ratings: [ratingSchema],
    subscription: { type: subscriptionSchema, default: () => ({}) },
    refreshToken: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
