require("dotenv").config();
const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const axios = require("axios");
const WebSocket = require("ws");
const verifyAdmin = require("./middleware/verifyAdmin.js");
const WebSocketConnection = require("./websocket/wsConnection.js");

const bot = new Telegraf(process.env.BOT_TOKEN);
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

const wsConnection = new WebSocketConnection("ws://localhost:8080");

let previousAdminAdsCount = 0;

// ADD THIS: Handle initial data to set baseline
wsConnection.onMessage("init", (message) => {
  const initialAdminAdsCount = message.adminAds?.length || 0;
  console.log(`📊 Initial admin ads count: ${initialAdminAdsCount}`);

  // Set initial count without sending notification
  previousAdminAdsCount = initialAdminAdsCount;
});

wsConnection.onMessage("adminUpdate", async (message) => {
  const currentCount = message.ads.length;
  console.log(
    `👑 Admin ads updated: ${currentCount} pending ads (was ${previousAdminAdsCount})`
  );

  try {
    const adminGroupId = process.env.ADMIN_GROUP_ID;

    if (!adminGroupId) {
      console.log("⚠️ No admin group configured");
      return;
    }

    // ONLY send notification if new ads were added
    if (currentCount > previousAdminAdsCount) {
      const newAdsCount = currentCount - previousAdminAdsCount;

      const notificationMessage =
        `🆕 *New Ad${newAdsCount > 1 ? "s" : ""} Submitted!*\n\n` +
        `📊 ${newAdsCount} new ad${
          newAdsCount > 1 ? "s" : ""
        } pending approval\n` +
        `📋 Total pending: ${currentCount} ad${currentCount > 1 ? "s" : ""}\n` +
        `⏰ ${new Date().toLocaleString()}\n\n` +
        `Please review ${
          newAdsCount > 1 ? "these ads" : "this ad"
        } for approval.`;

      await bot.telegram.sendMessage(adminGroupId, notificationMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Approve Now",
                callback_data: "approve_ads",
              },
              {
                text: "❌Reject Now",
                callback_data: "reject_ads",
              },
            ],
          ],
        },
      });

      console.log(`✅ Notified admin group about ${newAdsCount} new ad(s)`);
    } else if (currentCount < previousAdminAdsCount) {
      const processedCount = previousAdminAdsCount - currentCount;
      console.log(
        `✅ ${processedCount} ad(s) were processed (approved/rejected)`
      );
    } else {
      console.log(`📊 No change in pending ads count: ${currentCount}`);
    }

    // Update the previous count AFTER checking
    previousAdminAdsCount = currentCount;
  } catch (error) {
    console.error("❌ Error sending admin group notification:", error);
  }
});

wsConnection.connect();

bot.start(async (ctx) => {
  const token = ctx.startPayload;
  if (!token) {
    return ctx.reply("❌ Invalid or missing token.");
  }

  if (ctx.chat.type !== "private") return;

  try {
    const response = await axios.put(
      `${API_GATEWAY_URL}/api/users/telegram/verify`,
      {
        token,
        chatId: ctx.chat.id,
        userId: ctx.from.id.toString(),
      }
    );

    if (response.data.success) {
      if (response.data.action === "disconnect") {
        ctx.reply(
          "🔓 *Telegram Disconnected Successfully!*\n\n" +
            "Your account is no longer linked to this bot.\n" +
            "You won't receive notifications anymore.\n\n" +
            "Thank you for using Global Advertising! 👋",
          { parse_mode: "Markdown" }
        );
      } else if (response.data.action === "connect") {
        ctx.reply(
          "🔗 *Telegram Connected Successfully!*\n\n" +
            `Welcome ${ctx.from.first_name}! 🎉\n\n` +
            "Your account is now linked to this bot.\n" +
            "You'll receive notifications about:\n" +
            "• Ad approvals and rejections\n" +
            "• Account updates\n" +
            "• Important announcements\n\n" +
            "Thank you for using Global Advertising! 🚀",
          { parse_mode: "Markdown" }
        );
      }
    } else {
      ctx.reply("❌ Failed to process request. Invalid or expired token.");
    }
  } catch (error) {
    console.error("Bot error:", error);
    if (error.response) {
      console.error("API Error:", error.response.data);
    }
    ctx.reply(
      "❌ Failed to verify token. Please try again or contact support."
    );
  }
});

bot.launch().then(() => console.log("🤖 Bot is running..."));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
