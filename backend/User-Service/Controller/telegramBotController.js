const User = require("../Model/userModel");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

// ! Telegram Connect link
const generateConnectLink = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID from frontend or session
    const isConnectedTelegram = req.user.telegram?.isConnected;

    if (!userId) return res.status(400).json({ message: "User ID required" });

    // Generate a temporary token
    const token = crypto.randomBytes(16).toString("hex");

    // Save token to user
    await User.findByIdAndUpdate(userId, {
      "telegram.verifyToken": token,
    });

    // Return Telegram bot link
    const botUsername = process.env.BOT_USERNAME; // e.g. "MyBot"
    const link = `https://t.me/${botUsername}?start=${token}&isConnected=${isConnectedTelegram}`;

    return res.json({ link });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

const verifyTelegramConnection = asyncHandler(async (req, res) => {
  const { token, chatId, userId } = req.body;

  const user = await User.findOne({ "telegram.verifyToken": token });
  if (!user)
    return res.status(400).json({ success: false, message: "Invalid token" });

  if (user.telegram?.isConnected) {
    // User is disconnecting
    user.telegram = {
      userId: null,
      chatId: null,
      isConnected: false,
      verifyToken: null,
    };
    await user.save();

    return res.json({
      success: true,
      action: "disconnect",
      message: "Telegram disconnected successfully",
      isConnected: false,
    });
  } else {
    // User is connecting
    user.telegram = {
      userId,
      chatId,
      isConnected: true,
      verifyToken: null,
    };
    await user.save();

    return res.json({
      success: true,
      action: "connect",
      message: "Telegram connected successfully",
      isConnected: true,
      chatId: chatId,
    });
  }
});

const getTelegramStatus = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("telegram");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      success: true,
      telegram: {
        isConnected: user.telegram?.isConnected || false,
        chatId: user.telegram?.chatId || null,
        lastUpdated: user.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ! Admin controller
const isAdmin = asyncHandler(async (req, res) => {
  const { telegramUserId } = req.body;
  if (!telegramUserId)
    return res.status(400).json({ message: "Telegram User ID required" });

  const user = await User.findOne({
    "telegram.userId": telegramUserId,
    role: "admin",
  });
  if (!user)
    return res.status(403).json({ success: false, message: "Not an admin" });

  return res.json({ success: true, message: "Is an admin", userId: user._id });
});

module.exports = {
  generateConnectLink,
  verifyTelegramConnection,
  getTelegramStatus,
  isAdmin,
};
