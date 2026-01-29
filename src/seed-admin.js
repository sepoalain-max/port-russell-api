require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "sepoalain@gmail.com";
    const password = "Password123!";
    const username = "Admin";

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("✅ Admin existe déjà :", email);
      process.exit(0);
    }

    const passwordHash = await User.hashPassword(password);
    await User.create({ username, email, passwordHash });

    console.log("✅ Admin créé !");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed error:", e);
    process.exit(1);
  }
})();
