const User = require("../models/User");

// POST /users
async function createUser(req, res) {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email déjà utilisé" });

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ username, email: email.toLowerCase(), passwordHash });

  return res.status(201).json({ username: user.username, email: user.email });
}

// GET /users
async function listUsers(req, res) {
  const users = await User.find().select("username email createdAt updatedAt");
  res.json(users);
}

// GET /users/:email
async function getUserByEmail(req, res) {
  const email = req.params.email.toLowerCase();
  const user = await User.findOne({ email }).select("username email createdAt updatedAt");
  if (!user) return res.status(404).json({ message: "User introuvable" });
  res.json(user);
}

// PUT /users/:email
async function updateUser(req, res) {
  const email = req.params.email.toLowerCase();
  const { username, password } = req.body;

  const update = {};
  if (username !== undefined) update.username = String(username).trim();
  if (password !== undefined) update.passwordHash = await User.hashPassword(String(password));

  const user = await User.findOneAndUpdate({ email }, update, { new: true })
    .select("username email createdAt updatedAt");

  if (!user) return res.status(404).json({ message: "User introuvable" });
  res.json(user);
}

// DELETE /users/:email
async function deleteUser(req, res) {
  const email = req.params.email.toLowerCase();
  const deleted = await User.findOneAndDelete({ email });
  if (!deleted) return res.status(404).json({ message: "User introuvable" });
  res.status(204).send();
}

module.exports = { createUser, listUsers, getUserByEmail, updateUser, deleteUser };
