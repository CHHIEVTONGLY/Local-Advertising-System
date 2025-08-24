const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { randomBytes } = require("crypto");

function generateOrderId(len = 12) {
  const alphabet = "abcdefghijklmnopqrst1234567890";
  const bytes = randomBytes(len);
  let id = "";
  for (let i = 0; i < len; i++) id += alphabet[bytes[i] % alphabet.length];
  return id;
}

const Transaction = new Schema(
  {
    userId: { type: String, required: true },
    walletId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["deposit", "deduction"],
      required: true,
    },

    orderId: {
      type: String,
      unique: true,
      index: true,
      default: () => generateOrderId(8),
    },
    productTitle: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const transactionModel = mongoose.model("Transaction", Transaction);

module.exports = transactionModel;
