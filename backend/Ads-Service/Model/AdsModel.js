const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Ads = new Schema(
  {
    publisherId: { type: String, required: true },
    led: { type: Schema.Types.ObjectId, ref: "LED", required: true },
    mediaUrl: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    duration: { type: Number, required: true },
    displayTime: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
    },
    pricePerSecond: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "pending", "active", "completed"],
      default: "draft",
    },
    billingStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    totalCost: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

Ads.index({ led: 1, startTime: 1, endTime: 1 }, { unique: false });

const adsModel = mongoose.model("Ads", Ads);

module.exports = adsModel;
