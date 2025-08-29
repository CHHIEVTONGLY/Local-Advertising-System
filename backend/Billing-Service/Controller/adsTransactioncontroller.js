const adsTransaction = require("../Model/adsTransactionModel");
const asyncHandler = require("express-async-handler");

const createAdsTransaction = asyncHandler(async (req, res) => {
  const { adsTitle, adsId, pricePerSecond, totalCost, status, displayTime } =
    req.body;
  const publisherId = req.user.id;

  const newTransaction = await adsTransaction.create({
    adsTitle,
    adsId,
    publisherId,
    pricePerSecond,
    totalCost,
    status,
    displayTime,
  });

  res.status(201).json(newTransaction);
});

const getTransactionsByUser = asyncHandler(async (req, res) => {
  try {
    const { publisherId } = req.params;
    if (!publisherId) {
      return res.status(400).json({ message: "publisherId is required" });
    }

    const transactions = await adsTransaction
      .find({ publisherId })
      .sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createAdsTransaction,
  getTransactionsByUser,
};
