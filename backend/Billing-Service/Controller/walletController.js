const Wallet = require("../Model/walletModel");
const Transaction = require("../Model/transactionModel");
const asyncHandler = require("express-async-handler");

const getWallet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    res.json({ wallet });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const createWallet = asyncHandler(async (req, res) => {
  try {
    const key = req.headers["x-create-wallet-key"];
    if (!key || key !== process.env.SECRET_CREATE_WALLET_KEY) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { userId } = req.body;

    let wallet = await Wallet.findOne({ userId });
    if (wallet) return res.status(409).json({ error: "Wallet already exists" });

    wallet = await Wallet.create({ userId, balance: 0 });
    res.status(200).send({ success: true, data: wallet });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const deposit = asyncHandler(async (req, res) => {
  try {
    const key = req.headers["x-wallet-key"];
    if (!key || key !== process.env.SECRET_WALLET_KEY) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { amount, type, userId } = req.body;

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

const deduct = asyncHandler(async (req, res) => {
  try {
    // const key = req.headers["x-wallet-key"];
    // if (!key || key !== process.env.SECRET_WALLET_KEY) {
    //   return res.status(403).json({ error: "Forbidden" });
    // }
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
