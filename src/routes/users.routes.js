const router = require("express").Router();
const { authRequired } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createUserValidator, emailParamValidator } = require("../validators/user.validators");
const ctrl = require("../controllers/users.controller");

router.use(authRequired);

router.get("/", ctrl.listUsers);
router.get("/:email", emailParamValidator, validate, ctrl.getUserByEmail);
router.post("/", createUserValidator, validate, ctrl.createUser);
router.put("/:email", emailParamValidator, validate, ctrl.updateUser);
router.delete("/:email", emailParamValidator, validate, ctrl.deleteUser);

module.exports = router;
