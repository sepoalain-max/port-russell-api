const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const catwaysRoutes = require("./routes/catways.routes");
const { errorHandler } = require("./middlewares/error.middleware");
const { authRequired } = require("./middlewares/auth.middleware");

const app = express();

// sécurité
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, max: 120 })); // anti brute force simple

// views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// pages demandées
app.get("/", (req, res) => res.render("home"));
app.get("/dashboard", authRequired, (req, res) => res.render("dashboard", { user: req.user }));
app.get("/ui/catways", authRequired, (req, res) => res.render("catways", { user: req.user }));
app.get("/ui/reservations", authRequired, (req, res) => res.render("reservations", { user: req.user }));
app.get("/ui/users", authRequired, (req, res) => res.render("users", { user: req.user }));
app.get("/docs", (req, res) => res.render("api-docs"));

// API
app.use(authRoutes);
app.use("/users", usersRoutes);
app.use("/catways", catwaysRoutes);

app.use(errorHandler);

module.exports = app;
