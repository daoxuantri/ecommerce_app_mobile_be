const brandController = require("../controllers/brands.controller");
const express = require("express");
const router = express.Router();

router.post("/createbrand", brandController.createbrand);
router.post("/deletebrand", brandController.deletebrand);

module.exports = router;    