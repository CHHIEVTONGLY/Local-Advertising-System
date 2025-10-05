const Wallet = require("../Model/walletModel");
const Transaction = require("../Model/transactionModel");
const asyncHandler = require("express-async-handler");

const internalDeposit = asyncHandler(async (req, res) => {
  try {
    const { userId, amount, type } = req.body;

    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const validTypes = ["deposit", "refund"];

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });

    wallet.balance += amount;
    await wallet.save();

    const transaction = await Transaction.create({
      walletId: wallet._id.toString(),
      userId,
      amount,
      type: type || "deposit",
    });

    res.status(200).send({ success: true, data: { wallet, transaction } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { internalDeposit };
