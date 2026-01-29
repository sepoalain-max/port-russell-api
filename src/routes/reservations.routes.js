const express = require("express");
const { authRequired } = require("../middleware/auth");
const ctrl = require("../controllers/reservations.controller");

const router = express.Router({ mergeParams: true });

router.use(authRequired);

router.get("/", ctrl.listReservations);
router.post("/", ctrl.createReservation);

router.get("/:idReservation", ctrl.getReservation);
router.put("/:idReservation", ctrl.updateReservation);
router.delete("/:idReservation", ctrl.deleteReservation);

module.exports = router;
