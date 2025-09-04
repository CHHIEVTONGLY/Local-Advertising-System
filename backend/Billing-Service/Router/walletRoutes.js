const express = require("express");
const router = express.Router();
const { requireAuth } = require("../Middleware/verifyToken");

const {
  getWallet,
  createWallet,
  deposit,
  deduct,
} = require("../Controller/walletController");

router.get("/me", requireAuth, getWallet);
router.post("/create", createWallet);
router.post("/deposit", requireAuth, deposit);
router.post("/deduct", requireAuth, deduct);

module.exports = router;
