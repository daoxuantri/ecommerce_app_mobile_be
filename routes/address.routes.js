const addressController = require("../controllers/address.controller"); 
const express = require("express");
const router = express.Router();


router.post("/create",  addressController.createaddress);
router.get("/:idUser",  addressController.getalladdressbyuser);
router.get("/:idUser/getdefault",  addressController.getaddressdefault);
router.delete("/user/:userId/location/:locationId", addressController.deleteLocation);
module.exports = router;    