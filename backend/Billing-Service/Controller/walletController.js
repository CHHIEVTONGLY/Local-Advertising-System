const Wallet = require("../Model/walletModel");
const Transaction = require("../Model/transactionModel");
const asyncHandler = require("express-async-handler");

const getWallet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    res.json({ wallet });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const createWallet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });
    if (wallet) return res.status(400).json({ error: "Wallet already exists" });

    wallet = await Wallet.create({ userId, balance: 0 });
    res.status(200).send({ success: true, data: wallet });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const deposit = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });

    wallet.balance += amount;
    await wallet.save();

    const transaction = await Transaction.create({
      walletId: wallet._id.toString(),
      userId,
      amount,
      type: "deposit",
    });

    res.status(200).send({ success: true, data: { wallet, transaction } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const deduct = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    wallet.balance -= amount;
    await wallet.save();

    const transaction = await Transaction.create({
      walletId: wallet._id.toString(),
      userId,
      amount,
      type: "deduction",
    });

    res.json({ wallet, transaction });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = {
  getWallet,
  createWallet,
  deposit,
  deduct,
};
