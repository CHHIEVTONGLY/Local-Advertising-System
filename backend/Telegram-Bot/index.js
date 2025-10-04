require("dotenv").config();
const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;
bot.start(async (ctx) => {
  const token = ctx.startPayload;
  if (!token) {
    return ctx.reply("❌ Invalid or missing token.");
  }

  try {
    const response = await axios.put(
      `${API_GATEWAY_URL}/api/users/telegram/verify`,
      {
        token,
        chatId: ctx.chat.id,
      }
    );

    console.log("=== BACKEND RESPONSE ===");
    console.log("Success:", response.data.success);
    console.log("Action:", response.data.action);
    console.log("Message:", response.data.message);
    console.log("Is Connected:", response.data.isConnected);
    console.log("========================");

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
bot.launch().then(() => console.log("Bot is running..."));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
