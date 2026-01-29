const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization || "").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

module.exports = { authRequired };
