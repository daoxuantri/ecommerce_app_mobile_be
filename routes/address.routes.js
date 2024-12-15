const addressController = require("../controllers/address.controller"); 
const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();

router.put("/",auth.authenticateToken, addressController.updateDefaultAddress);
router.post("/create",auth.authenticateToken , addressController.createaddress);
router.get("/",  auth.authenticateToken , addressController.getalladdressbyuser);
router.get("/getdefault",auth.authenticateToken ,  addressController.getaddressdefault);
router.delete("/:locationId",auth.authenticateToken , addressController.deleteLocation);
module.exports = router;    