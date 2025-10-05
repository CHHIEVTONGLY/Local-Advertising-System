const express = require("express");
const router = express.Router();

const {
  generateConnectLink,
  isAdmin,
  getTelegramStatus,
  verifyTelegramConnection,
} = require("../Controller/telegramBotController");

const { verifyToken } = require("../Middleware/verifyToken.js");
const { botAuth } = require("../Middleware/botAuth.js");

// ! Telegram Bot Integration
router.post("/connect", verifyToken, generateConnectLink);
router.get("/status", verifyToken, getTelegramStatus);

// Update Telegram connection status
router.put("/verify", verifyTelegramConnection);

// ! Admin Routes
router.post("/admin", botAuth, isAdmin);

module.exports = router;
