const Reservation = require("../models/Reservation");
const Catway = require("../models/Catway");

async function listReservations(req, res) {
  const catwayNumber = Number(req.params.id);
  const items = await Reservation.find({ catwayNumber });
  res.json(items);
}

async function getReservation(req, res) {
  const { id, idReservation } = req.params;
  const item = await Reservation.findOne({ _id: idReservation, catwayNumber: Number(id) });
  if (!item) return res.status(404).json({ message: "Réservation introuvable" });
  res.json(item);
}

async function createReservation(req, res) {
  const catwayNumber = Number(req.params.id);

  const catway = await Catway.findOne({ catwayNumber });
  if (!catway) return res.status(404).json({ message: "Catway introuvable" });

  const created = await Reservation.create({
    catwayNumber,
    ...req.body
  });

  res.status(201).json(created);
}

async function updateReservation(req, res) {
  const { id, idReservation } = req.params;

  const item = await Reservation.findOneAndUpdate(
    { _id: idReservation, catwayNumber: Number(id) },
    req.body,
    { new: true, runValidators: true }
  );

  if (!item) return res.status(404).json({ message: "Réservation introuvable" });
  res.json(item);
}

async function deleteReservation(req, res) {
  const { id, idReservation } = req.params;

  const deleted = await Reservation.findOneAndDelete({
    _id: idReservation,
    catwayNumber: Number(id)
  });

  if (!deleted) return res.status(404).json({ message: "Réservation introuvable" });
  res.status(204).send();
}

module.exports = {
  listReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation
};
