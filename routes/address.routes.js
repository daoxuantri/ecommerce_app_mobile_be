const addressController = require("../controllers/address.controller"); 
const express = require("express");
const router = express.Router();


router.post("/create",  addressController.createaddress);
router.get("/:idUser",  addressController.getalladdressbyuser);
router.get("/:idUser/getdefault",  addressController.getaddressdefault);

module.exports = router;    