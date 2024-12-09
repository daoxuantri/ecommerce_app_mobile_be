const billController = require("../controllers/bills.controller");
const express = require("express");
const router = express.Router();

router.post("/setStatusOrder",billController.setStatusOrder);

module.exports = router;    