const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adsTransaction = new Schema(
  {
    adsTitle: { type: String, required: true },
    adsId: { type: String, required: true },
    publisherId: { type: String, required: true },
    pricePerSecond: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    status: { type: String, required: true },
    displayTime: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const adsTransactionModel = mongoose.model("adsTransaction", adsTransaction);

module.exports = adsTransactionModel;
