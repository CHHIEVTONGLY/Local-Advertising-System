const Transaction = require("../Model/transactionModel");
const asyncHandler = require("express-async-handler");

const getTransaction = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const type = req.query.type?.toLowerCase(); // deposit, deduction, refund
  const startDate = req.query.startDate; // custom start date
  const endDate = req.query.endDate; // custom end date
  const skip = (page - 1) * limit;

  // Build query dynamically
  const query = { userId };

  // Type filter
  if (type && ["deposit", "deduction", "refund"].includes(type)) {
    query.type = type;
  }

  // Custom date filter
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lt: new Date(endDate),
    };
  }

  // Fetch transactions with filters
  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

  res.status(200).send({
    transactions,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

module.exports = { getTransaction };
