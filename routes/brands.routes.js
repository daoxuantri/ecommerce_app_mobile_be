const brandController = require("../controllers/brands.controller");
const express = require("express");
const router = express.Router();
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");


//role (admin , employee)
router.post("/createbrand", uploadCloud.array('images'), brandController.createbrand);
 
router.get("/getallbrand",  brandController.getallbrand);
router.get("/getbrandbyid",  brandController.getbrandbyid);

//(Xem bo sung => ko can thiet thi bo)
router.post("/deletebrand/:id", brandController.deletebrand);

module.exports = router;    