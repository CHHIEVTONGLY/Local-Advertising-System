const botAuth = (req, res, next) => {
  const key = req.headers["x-wallet-key"];
  if (!key || key !== process.env.SECRET_WALLET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

module.exports = { botAuth };
