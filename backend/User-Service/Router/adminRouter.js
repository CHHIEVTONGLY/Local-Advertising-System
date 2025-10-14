const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const { loginValidator } = require("../Validation/userValidation.js");
const { login } = require("../Controller/userController.js");
// Admin router

router.post("/login", loginValidator, login);

module.exports = router;
