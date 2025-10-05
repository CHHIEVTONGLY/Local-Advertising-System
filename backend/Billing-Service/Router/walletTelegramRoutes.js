const express = require("express");
const router = express.Router();

const { botAuth } = require("../Middleware/botAuth");
const { internalDeposit } = require("../Controller/walletTelegramController");

// ! Telegram bot route for internal deposit
router.post("/deposit", botAuth, internalDeposit);

module.exports = router;
