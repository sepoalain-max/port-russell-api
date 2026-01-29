const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function login(req, res) {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    // défensif
    if (!email || !password) {
      return res.status(400).json({ message: "email et password requis" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Identifiants invalides" });

    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ message: "Identifiants invalides" });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );

    // cookie sécurisé (en prod: secure:true + sameSite:"strict")
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    // ✅ Si la requête vient d’un formulaire HTML -> redirection
    const accept = req.headers.accept || "";
    if (accept.includes("text/html")) {
      return res.redirect("/dashboard");
    }

    // ✅ Sinon (Postman/fetch) -> JSON
    return res.json({ message: "Connecté", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

function logout(req, res) {
  res.clearCookie("token");

  // UX: si déconnexion depuis le navigateur, retour à l'accueil
  const accept = req.headers.accept || "";
  if (accept.includes("text/html")) {
    return res.redirect("/");
  }

  return res.json({ message: "Déconnecté" });
}

module.exports = { login, logout };
