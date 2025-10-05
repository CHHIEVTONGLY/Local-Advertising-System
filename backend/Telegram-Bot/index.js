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

// Store previous ad IDs to track new ones
let previousAdIds = new Set();

wsConnection.onMessage("init", (message) => {
  const initialAdminAdsCount = message.adminAds?.length || 0;
  console.log(`📊 Initial admin ads count: ${initialAdminAdsCount}`);

  // Store initial ad IDs
  previousAdIds = new Set(message.adminAds?.map((ad) => ad._id) || []);
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

    // GET ACTUALLY NEW ADS by comparing IDs
    const currentAdIds = new Set(message.ads.map((ad) => ad._id));
    const newAdIds = [...currentAdIds].filter((id) => !previousAdIds.has(id));

    if (newAdIds.length > 0) {
      // Get the actual new ad objects
      const newAds = message.ads.filter((ad) => newAdIds.includes(ad._id));

      // Sort by creation time (most recent first)
      const sortedNewAds = newAds.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // CREATE RICH NOTIFICATION WITH NEW AD DETAILS
      const latestAd = sortedNewAds[0]; // Most recent

      const adDetailsMessage =
        `\n\n📄 *Latest Ad Details:*\n` +
        `🎯 Ads ID: \`${latestAd._id}\`\n` +
        `🏷️ **${latestAd.title}**\n` +
        `💰 Total Cost: $${latestAd.totalCost}\n` +
        `⏱️ Duration: ${latestAd.duration} seconds\n` +
        `🎬 Type: ${latestAd.type.toUpperCase()}\n` +
        `💵 Rate: $${latestAd.pricePerSecond}/second`;

      if (sortedNewAds.length > 1) {
        const otherAdsMessage =
          `\n\n📋 *Other New Ads:*\n` +
          sortedNewAds
            .slice(1)
            .map((ad, index) => `${index + 2}. ${ad.title} - $${ad.totalCost}`)
            .join("\n");

        adDetailsMessage += otherAdsMessage;
      }

      const notificationMessage =
        `🆕 *${sortedNewAds.length} New Ad${
          sortedNewAds.length > 1 ? "s" : ""
        } Submitted!*\n\n` +
        `📊 Total pending: ${currentCount} ad${currentCount > 1 ? "s" : ""}\n` +
        `⏰ ${new Date().toLocaleString()}` +
        adDetailsMessage +
        `\n\nPlease review for approval! ⬇️`;

      if (latestAd.type === "image") {
        await bot.telegram.sendPhoto(adminGroupId, latestAd.mediaUrl, {
          caption: notificationMessage,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Approve",
                  callback_data: `approve_${latestAd._id}`,
                },
                {
                  text: "❌ Reject",
                  callback_data: `reject_${latestAd._id}`,
                },
              ],
            ],
          },
        });
      } else if (latestAd.type === "video") {
        await bot.telegram.sendVideo(adminGroupId, latestAd.mediaUrl, {
          caption: notificationMessage,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Approve",
                  callback_data: `approve_${latestAd._id}`,
                },
                {
                  text: "❌ Reject",
                  callback_data: `reject_${latestAd._id}`,
                },
              ],
            ],
          },
        });
      }

      console.log(
        `✅ Notified admin group about ${sortedNewAds.length} new ad(s)`
      );

      // Update stored ad IDs
      previousAdIds = currentAdIds;
    } else if (currentCount < previousAdminAdsCount) {
      const processedCount = previousAdminAdsCount - currentCount;
      console.log(
        `✅ ${processedCount} ad(s) were processed (approved/rejected)`
      );

      // Update stored ad IDs
      previousAdIds = currentAdIds;
    } else {
      console.log(`📊 No change in pending ads`);
    }

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

bot.on("callback_query", async (ctx) => {
  const action = ctx.callbackQuery.data;
  const telegramUserId = ctx.from.id.toString();
  try {
    // NOTE Admin approvals
    const adId = action.split("_")[1];
    if (action.startsWith("approve_")) {
      const response = await axios.post(
        `${API_GATEWAY_URL}/api/users/telegram/admin`,
        {
          telegramUserId,
        },
        {
          headers: {
            "x-bot-token": process.env.BOT_TOKEN,
          },
        }
      );

      if (response.data) {
        // TODO Approval the ads via bot
        const approvalResponse = await axios.put(
          `${API_GATEWAY_URL}/api/ads/telegram/approve-via-bot/${adId}`,
          {
            telegramUserId,
            reviewStatus: "approved",
          },
          {
            headers: {
              "x-bot-token": process.env.BOT_TOKEN,
            },
          }
        );

        if (approvalResponse.data) {
          try {
            ctx.answerCbQuery("✅ Ad approved successfully");
            const caption = ctx.callbackQuery.message.caption || "";

            let adminDisplay = "";

            if (ctx.from.username) {
              // If user has username, create a clickable link
              adminDisplay = `[${ctx.from.first_name} ${ctx.from.last_name}](https://t.me/${ctx.from.username})`;
            } else {
              // If no username, just show the name
              const lastName = ctx.from.last_name || "";
              const fullName = `${ctx.from.first_name}${
                lastName ? " " + lastName : ""
              }`;
              adminDisplay = `*${fullName}*`;
            }

            const cleanedCaption = caption
              .replace("Please review for approval! ⬇️", "")
              .trim();

            const approvalMessage =
              `\n\n✅ **STATUS: APPROVED**\n` +
              `👤 By: ${adminDisplay}\n` +
              `🆔 Admin ID: \`${ctx.from.id}\`\n` +
              `📅 Time: \`${new Date().toLocaleString()}\`\n`;

            ctx.editMessageCaption(cleanedCaption + approvalMessage, {
              parse_mode: "Markdown",
              reply_markup: { inline_keyboard: [] },
            });
          } catch (error) {
            ctx.answerCbQuery("❌ Error updating message caption");
          }
        }
      }
    } else if (action.startsWith("reject_")) {
      // ! Reject ads
      const response = await axios.post(
        `${API_GATEWAY_URL}/api/users/telegram/admin`,
        {
          telegramUserId,
        },
        {
          headers: {
            "x-bot-token": process.env.BOT_TOKEN,
          },
        }
      );

      if (response.data) {
        // TODO Reject the ads via bot
        const rejectionResponse = await axios.put(
          `${API_GATEWAY_URL}/api/ads/telegram/approve-via-bot/${adId}`,
          {
            telegramUserId,
            reviewStatus: "rejected",
          },
          {
            headers: {
              "x-bot-token": process.env.BOT_TOKEN,
            },
          }
        );
        if (rejectionResponse.data) {
          console.log(response.data);
          try {
            ctx.answerCbQuery(`✅ Ad rejected & refund sucessfully `);
            const caption = ctx.callbackQuery.message.caption || "";

            let adminDisplay = "";

            if (ctx.from.username) {
              // If user has username, create a clickable link
              adminDisplay = `[${ctx.from.first_name} ${ctx.from.last_name}](https://t.me/${ctx.from.username})`;
            } else {
              // If no username, just show the name
              const lastName = ctx.from.last_name || "";
              const fullName = `${ctx.from.first_name}${
                lastName ? " " + lastName : ""
              }`;
              adminDisplay = `*${fullName}*`;
            }

            const cleanedCaption = caption
              .replace("Please review for approval! ⬇️", "")
              .trim();

            const rejectionMessage =
              `\n\n❌ **STATUS: REJECTED**\n` +
              `👤 By: ${adminDisplay}\n` +
              `🆔 Admin ID: \`${ctx.from.id}\`\n` +
              `📅 Time: \`${new Date().toLocaleString()}\`\n`;

            ctx.editMessageCaption(cleanedCaption + rejectionMessage, {
              parse_mode: "Markdown",
              reply_markup: { inline_keyboard: [] },
            });
          } catch (error) {
            ctx.answerCbQuery("❌ Error updating message caption");
          }
        }
      }
    }
  } catch (error) {
    ctx.answerCbQuery(`❌ ${error.response.data.message}`, {
      show_alert: true,
    });
  }
});

bot.launch().then(() => console.log("🤖 Bot is running..."));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
