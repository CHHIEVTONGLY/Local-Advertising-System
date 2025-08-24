const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Wallet = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const walletModel = mongoose.model("Wallet", Wallet);

module.exports = walletModel;
