const brandController = require("../controllers/brands.controller");
const userController = require("../controllers/users.controller");
const express = require("express");
const router = express.Router();

router.post("/register", userController.register);
// router.post("/login", brandController.login);

module.exports = router;    