const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    const id = payload.sub || payload.id || payload.userId;
    if (!id) return res.status(401).json({ error: "Invalid token" });
    req.user = { id, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  });
}

module.exports = { requireAuth, requireAdmin };
