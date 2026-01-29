const { body, param } = require("express-validator");

const createUserValidator = [
  body("username")
    .isString().withMessage("username doit être une chaîne")
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("username: 2 à 50 caractères"),

  body("email")
    .isEmail().withMessage("email invalide")
    .normalizeEmail(),

  body("password")
    .isString().withMessage("password doit être une chaîne")
    .isLength({ min: 8 }).withMessage("Mot de passe min 8 caractères"),
];

const emailParamValidator = [
  param("email")
    .isEmail().withMessage("Paramètre email invalide")
    .normalizeEmail(),
];

module.exports = { createUserValidator, emailParamValidator };
