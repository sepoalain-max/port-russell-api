const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    catwayNumber: { type: Number, required: true },
    clientName: { type: String, required: true, trim: true },
    boatName: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

reservationSchema.pre("validate", function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error("endDate ne peut pas être avant startDate"));
  }
  next();
});

module.exports = mongoose.model("Reservation", reservationSchema);
