const router = require("express").Router();
const { authRequired } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/catways.controller");
const rctrl = require("../controllers/reservations.controller");

router.use(authRequired);

// Catways
router.get("/", ctrl.listCatways);
router.get("/:id", ctrl.getCatway);
router.post("/", ctrl.createCatway);
router.put("/:id", ctrl.updateCatwayState);
router.delete("/:id", ctrl.deleteCatway);

// Reservations (sous-ressource)
router.get("/:id/reservations", rctrl.listReservations);
router.get("/:id/reservations/:idReservation", rctrl.getReservation);
router.post("/:id/reservations", rctrl.createReservation);
router.put("/:id/reservations/:idReservation", rctrl.updateReservation);
router.delete("/:id/reservations/:idReservation", rctrl.deleteReservation);

module.exports = router;
