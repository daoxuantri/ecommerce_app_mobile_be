const billController = require("../controllers/bills.controller");
const express = require("express");
const router = express.Router();
router.get('/', billController.getBills)
router.post("/setStatusOrder",billController.setStatusOrder);
router.get('/user/:userId', billController.getBillsByUser);
module.exports = router;    