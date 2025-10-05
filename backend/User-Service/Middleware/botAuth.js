const botAuth = (req, res, next) => {
  const botToken = req.headers["x-bot-token"];
  if (!botToken || botToken !== process.env.BOT_TOKEN) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized bot request",
    });
  }
  next();
};

module.exports = { botAuth };
