const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");

const verifyToken = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access Denied!" });
  }

  token = token.replace("Bearer ", "");
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decode.id).select(
      "id email role telegram.chatId telegram.isConnected"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  next();
};

const verifyPublisher = (req, res, next) => {
  if (req.user.role === "publisher" || req.user.role === "admin") {
    return next();
  }
  return res.status(403).send("Access denied");
};

const tryVerifyToken = async (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) {
    req.user = null;
    return next(); // Allow anonymous
  }

  token = token.replace("Bearer ", "");
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decode.id).select("id email role");

    if (!user) req.user = null;
    else req.user = user;
  } catch (error) {
    req.user = null;
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyPublisher, tryVerifyToken };
