require("dotenv").config();

// FALLBACK APPROACH
const ADMIN_TELEGRAM_IDS = process.env.ADMIN_TELEGRAM_IDS
  ? process.env.ADMIN_TELEGRAM_IDS.split(",").map((id) => Number(id))
  : []; // Empty array if not set

const verifyAdmin = async (ctx, next) => {
  try {
    // If no admin IDs configured, allow all (development mode)
    if (ADMIN_TELEGRAM_IDS.length === 0) {
      console.log("⚠️ No admin IDs configured - allowing all users");
      return await next();
    }

    const telegramUserId = ctx.from.id;
    const isAdmin = ADMIN_TELEGRAM_IDS.includes(telegramUserId);

    if (!isAdmin) {
      return ctx.reply("❌ Access denied. You are not an admin.");
    }

    await next();
  } catch (error) {
    console.error("Admin verification error:", error);
    ctx.reply("❌ An error occurred while verifying admin status.");
  }
};

module.exports = verifyAdmin;
