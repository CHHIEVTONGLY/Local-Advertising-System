const Transaction = require("../Model/transactionModel");
const asyncHandler = require("express-async-handler");

const getTransaction = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({ userId })
    .sort({ createdAt: -1 }) // latest first
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments({ userId });

  res
    .status(200)
    .send({ transactions, total, page, pages: Math.ceil(total / limit) });
});

module.exports = { getTransaction };
