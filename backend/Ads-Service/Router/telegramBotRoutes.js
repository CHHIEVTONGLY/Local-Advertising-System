const express = require("express");
const router = express.Router();

const { botAuth } = require("../Middleware/botAuth");
const { approvalAdsViaBot } = require("../Controller/telegramBotController");

// ! Telegram bot route
router.put("/approve-via-bot/:adsId", botAuth, approvalAdsViaBot);

module.exports = router;
