const Catway = require("../models/Catway");

async function listCatways(req, res) {
  const items = await Catway.find().sort({ catwayNumber: 1 });
  res.json(items);
}

async function getCatway(req, res) {
  const catwayNumber = Number(req.params.id);
  const item = await Catway.findOne({ catwayNumber });
  if (!item) return res.status(404).json({ message: "Catway introuvable" });
  res.json(item);
}

async function createCatway(req, res) {
  const { catwayNumber, catwayType, catwayState } = req.body;
  const created = await Catway.create({ catwayNumber, catwayType, catwayState });
  res.status(201).json(created);
}

async function updateCatwayState(req, res) {
  const catwayNumber = Number(req.params.id);
  const { catwayState } = req.body;

  const item = await Catway.findOneAndUpdate(
    { catwayNumber },
    { catwayState },
    { new: true }
  );

  if (!item) return res.status(404).json({ message: "Catway introuvable" });
  res.json(item);
}

async function deleteCatway(req, res) {
  const catwayNumber = Number(req.params.id);
  const deleted = await Catway.findOneAndDelete({ catwayNumber });
  if (!deleted) return res.status(404).json({ message: "Catway introuvable" });
  res.status(204).send();
}

module.exports = {
  listCatways,
  getCatway,
  createCatway,
  updateCatwayState,
  deleteCatway
};
