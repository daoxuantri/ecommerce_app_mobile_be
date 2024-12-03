const addressController = require("../controllers/address.controller"); 
const express = require("express");
const router = express.Router();


router.post("/create",  addressController.createaddress);
router.get("/:idUser",  addressController.getalladdressbyuser);
module.exports = router;    