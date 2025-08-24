const express = require("express");
const router = express.Router();
const { requireAuth } = require("../Middleware/verifyToken");

const { getTransaction } = require("../Controller/transactionController");

router.get("/me", requireAuth, getTransaction);

module.exports = router;
