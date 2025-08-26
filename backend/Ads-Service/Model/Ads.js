const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Ads = new Schema(
  {
    publisherId: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    orientation: {
      type: String,
      enum: ["portrait", "landscape"],
      required: true,
      default: "landscape",
    },
    duration: { type: Number, required: true },
    displayTime: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
    },
    pricePerSecond: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    totalCost: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const adsModel = mongoose.model("Ads", Ads);

module.exports = adsModel;
